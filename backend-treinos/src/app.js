require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {connectDB} = require('./config/db.js');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexao com o Banco
connectDB();

// Rota de teste
app.get('/', (req, res) => {
  res.send('API de Treinos rodando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});