require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {connectDB} = require('./config/db.js');
const authRoutes = require('./routes/authRoutes.js');
const workoutRoutes = require('./routes/workoutRoutes.js');
const attendanceRoutes = require('./routes/attendanceRoutes.js');
const formRoutes = require('./routes/formRoutes.js');

const app = express();

const allowedOrigins = [
  'https://atleta-checkin.vercel.app',
  'https://atleta-checkin-11h0m3ecd-vietos.vercel.app',
  'https://atleta-checkin.onrender.com',
  'http://localhost:64556',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Middlewares
// 1. Configuração do CORS
const corsOptions = {
  origin: true,
  /*(origin, callback) => {
    // Normaliza a origem removendo barra no final se existir
    const cleanOrigin = origin ? origin.replace(/\/$/, '') : null;
    
    if (!cleanOrigin || allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Origem bloqueada: ${origin}`);
      callback(null, false);
    }
  },
  */
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.options(/(.*)/, cors(corsOptions));

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

// 2. Tratamento de Rota Não Encontrada (404) garantindo headers de CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin.replace(/\/$/, ''))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.status(404).json({ message: 'Rota não encontrada na API.' });
});

// 3. Tratamento Global de Erros (500) garantindo headers de CORS
app.use((err, req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin.replace(/\/$/, ''))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  console.error('[SERVER ERROR]:', err.stack || err.message);
  res.status(500).json({ message: 'Erro interno no servidor.', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} & ${process.env.NODE_ENV}`);
});