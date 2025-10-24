// Importações
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');

console.log('Variáveis carregadas:', Object.keys(process.env).filter(key => key.includes('MONGO')));

// Inicialização
const app = express();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.MONGO_URI; 

console.log("URI está definida?", !!process.env.MONGO_URI);


app.use(express.json()); 

// Conexão com o MongoDB
mongoose.connect(DB_URI)
    .then(() => {
        console.log('✅ Conectado ao MongoDB com sucesso!');
       
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Falha na conexão com o MongoDB:', err);
    });


app.get('/', (req, res) => {
    res.status(200).send({ message: 'API Bancária em execução.' });
});