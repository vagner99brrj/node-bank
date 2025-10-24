// Importações
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');


// Inicialização
const app = express();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.MONGO_URI; 

app.use(express.json()); 

const accountRoutes = require('./routes/accountRoutes');
app.use('/api', accountRoutes);

//console.log('✅ Rotas carregadas:', app._router.stack.map(layer => layer.route?.path).filter(Boolean));

// Conexão com o MongoDB
mongoose.connect(DB_URI)
    .then(() => {
        console.log(' Conectado ao MongoDB com sucesso!');
       
        app.listen(PORT, () => {
            console.log(` Servidor rodando em http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error(' Falha na conexão com o MongoDB:', err);
    });


app.get('/', (req, res) => {
    res.status(200).send({ message: 'API Bancária em execução.' });
});