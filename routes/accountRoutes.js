const express = require('express');
const router = express.Router();
const Account = require('../models/Account.js');
const mongoose = require('mongoose'); // Necessário para transações (startSession)

// --- ROTA 1: Criar uma Nova Conta (POST /api/accounts) ---
router.post('/accounts', async (req, res) => {
    // console.log('✅ Rota /accounts foi chamada'); // Removida para manter o código limpo
    
    try {
        const { owner, accountNumber } = req.body;

        const newAccount = new Account({
            owner,
            accountNumber,
            balance: 0
        });

        await newAccount.save();

        res.status(201).json({
            message: 'Conta criada com sucesso!',
            account: newAccount
        });
    } catch (error) {
        if(error.code === 11000) {
            return res.status(400).json({ message: 'Erro: Número de conta já existe.' });
        }
        res.status(500).json({
            message: 'Erro interno do servidor ao criar a conta.',
            error: error.message
        });
    }
});

// --- ROTA 2: Buscar uma Conta pelo Número (GET /api/accounts/:accountNumber) ---
router.get('/accounts/:accountNumber', async (req, res) => {
    try {
        const { accountNumber } = req.params;

        const account = await Account.findOne({ accountNumber });

        if (!account) {
            return res.status(404).json({ message: 'Conta não encontrada.' });
        }

        res.status(200).json({ account });

    } catch (error) {
        res.status(500).json({
            message: 'Erro interno do servidor ao buscar conta.',
            error: error.message
        });
    }
});

// --- ROTA 3: Realizar Depósito em uma Conta (POST /api/deposit) ---
router.post('/deposit', async (req, res) => {
    const { accountNumber, amount } = req.body;
    
    if (!accountNumber || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Dados de depósito inválidos.' });
    }

    try {
        const account = await Account.findOne({ accountNumber });
        
        if (!account) {
            return res.status(404).json({ message: 'Conta de destino não encontrada.' });
        }
        
        account.balance += amount;
        await account.save();

        res.status(200).json({
            message: 'Depósito realizado com sucesso!',
            newBalance: account.balance
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Erro interno do servidor ao depositar.', 
            error: error.message 
        });
    }
});


// --- ROTA 4: Realizar Transferência entre Contas (POST /api/transfer) ---
router.post('/transfer', async (req, res) => {
    const { fromAccount, toAccount, amount } = req.body;
    
    if (!fromAccount || !toAccount || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Dados de transferência inválidos. Verifique as contas e o valor.' });
    }

    // O Mongoose Session é crucial para transações ACID
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Encontrar as contas (utilizando a session)
        const sender = await Account.findOne({ accountNumber: fromAccount }).session(session);
        const receiver = await Account.findOne({ accountNumber: toAccount }).session(session);

        if (!sender) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Conta de origem não encontrada.' });
        }
        if (!receiver) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Conta de destino não encontrada.' });
        }
        if (sender.balance < amount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Saldo insuficiente para a transferência.' });
        }
        
        // Realiza a transferência
        sender.balance -= amount;
        receiver.balance += amount;

        // Salva as mudanças nas contas (dentro da transação)
        await sender.save({ session });
        await receiver.save({ session });
        
        // Confirma as mudanças no DB
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: 'Transferência realizada com sucesso!',
            senderBalance: sender.balance,
            receiverBalance: receiver.balance
        });

    } catch (error) {
        // Desfaz todas as mudanças em caso de erro
        await session.abortTransaction();
        session.endSession();
        
        res.status(500).json({
            message: 'Erro interno ao processar a transferência.',
            error: error.message
        });
    }
});

module.exports = router;