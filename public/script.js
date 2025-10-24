// public/script.js

const API_BASE_URL = 'http://localhost:3000/api';

// Função para exibir resultados na interface
function showResult(elementId, message, isSuccess = true) {
    const resultDiv = document.getElementById(elementId);
    resultDiv.style.display = 'block';
    resultDiv.textContent = message;
    resultDiv.style.backgroundColor = isSuccess ? '#e6ffe6' : '#ffe6e6';
    resultDiv.style.border = isSuccess ? '1px solid #c8e6c9' : '1px solid #e6c8c8';
}

// Função para criar uma nova conta
async function createAccount() {
    const ownerName = document.getElementById('ownerName').value;
    const accountNumber = document.getElementById('newAccountNumber').value;

    if (!ownerName || !accountNumber) {
        showResult('createResult', 'Preencha todos os campos.', false);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/accounts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                owner: ownerName, // Usa 'owner' conforme o seu AccountSchema
                accountNumber: accountNumber 
            }),
        });

        const data = await response.json();

        if (response.ok) {
            showResult('createResult', `Sucesso! Conta ${data.account.accountNumber} criada para ${data.account.owner}.`, true);
        } else {
            // Exibe erro do backend (ex: Número de conta já existe)
            showResult('createResult', ` Erro ao criar conta: ${data.message}`, false);
        }

    } catch (error) {
        showResult('createResult', ' Erro de conexão com o servidor.', false);
        console.error('Erro na requisição:', error);
    }
}

//Rota para realizar transferência entre contas
async function transferFunds() {
    const fromAccount = document.getElementById('fromAccount').value;
    const toAccount = document.getElementById('toAccount').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (!fromAccount || !toAccount || !amount || amount <= 0) {
        showResult('transferResult', 'Preencha todos os campos e o valor deve ser maior que zero.', false);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                fromAccount: fromAccount,
                toAccount: toAccount,
                amount: amount
            }),
        });

        const data = await response.json();

        if (response.ok) {
            let msg = ` Transferência de R$ ${amount.toFixed(2)} concluída!`;
            msg += ` Origem (R$ ${data.senderBalance.toFixed(2)}) | Destino (R$ ${data.receiverBalance.toFixed(2)})`;
            showResult('transferResult', msg, true);
        } else {
            // Exibe erro do backend (ex: Saldo insuficiente, Conta não encontrada)
            showResult('transferResult', ` Erro na transferência: ${data.message}`, false);
        }

    } catch (error) {
        showResult('transferResult', ' Erro de conexão com o servidor.', false);
        console.error('Erro na requisição de transferência:', error);
    }
}