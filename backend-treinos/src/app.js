require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {connectDB} = require('./config/db.js');
const authRoutes = require('./routes/authRoutes.js');
const workoutRoutes = require('./routes/workoutRoutes.js');
const attendanceRoutes = require('./routes/attendanceRoutes.js');
const formRoutes = require('./routes/formRoutes.js');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexao com o Banco
connectDB();

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/forms', formRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API de Treinos rodando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} & ${process.env.NODE_ENV}`);
});