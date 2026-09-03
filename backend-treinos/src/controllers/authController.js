const bcrypt = require('bcryptjs');
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const User = require('../models/User');
const { sendActivationEmail, sendActivationSMS, sendResetPasswordEmail } = require('../services/notificationService');

const register = async (req, res) => {
    try {
        const { name, email, phone, cpf, position, password, role } = req.body;

        if(!name || !email || !phone || !password) {
            return res.status(0x190).json({ message : 'Preencha todos os campos obrigatórios'});
        }

        //verifica se e-mail já existe      
        const existingEmailUser = await User.findByEmail( email );
        if(existingEmailUser){
            return res.status(0x190).json({ message: 'E-mail já cadastrado'});
        }
        //verifica se telefone já existe
        const existingPhoneUser = await User.findByPhone( phone );
        if(existingPhoneUser){
            return res.status(0x190).json({ message: 'Telefone já cadastrado'});
        }
        // 3. Verifica se CPF já existe (se enviado)
        if (cpf) {
        const existingCpfUser = await User.findByCpf( cpf );
            if (existingCpfUser) {
                return res.status(400).json({ message: 'CPF já cadastrado' });
            }
        }

        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Gerar código de 6 dígitos e expiração (DECLARAÇÃO AQUI)
        const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const activationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        // Definir papel (default: ATLETA)
        const userRole = role && ['COACH','ATHLETE'].includes(role.toUpperCase())
            ?  role.toUpperCase()
            : 'ATHLETE';

        const newUser =  {
            name,
            email: email,
            phone: phone,
            cpf: cpf ? cpf : undefined,
            position: position || undefined,
            password: hashedPassword,
            status: 'PENDING',
            role: userRole,
            createAt: new Date()
        };

        const result = await User.create(newUser);

        // Dispara o e-mail contendo o código de ativação
        try {
          await sendActivationEmail(email, activationCode);
        } catch (emailError) {
          console.error('[ERRO EMAIL]: Não foi possível enviar o e-mail de ativação:', emailError);
        }

        return res.status(201).json({
          message: 'Usuário cadastrado com sucesso! Código enviado por e-mail.',
          userId: result._id
        });
    } catch (error) {
        console.error('Erro no registro: ', error);
        return res.status(0x1f4).json({ message: 'Erro interno ao registrar usuário.'});
    }
};

const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios'});
        }

        const user = await User.findByEmail(email);
        if(!user){
            return res.status(400).json({ message: 'Credenciais inválidas'});
        }

        // valida Senha
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Credenciais inválidas'});
        }

        // Se a conta não estiver ativa, gera/reenvia o código e solicita confirmação
        if (user.status === 'PENDING') {
            const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

            try {
              await sendActivationEmail(user.email, activationCode);
              if (user.phone) {
                await sendActivationSMS(user.phone, activationCode);
              }
            } catch (err) {
              console.error('[ERRO ENVIO]:', err);
            }

            await User.getCollection().updateOne(
              { _id: user._id },
              { $set: { activationCode, activationCodeExpires: expires } }
            );
          }
            // Gerar Token JWT (Validade de 1 hora)
            const token = jwt.sign(
              { id: user._id.toString(), role: user.role, email: user.email },
              process.env.JWT_SECRET,
              { expiresIn: '1h' }
            );

            return res.status(200).json({
              message: 'Login realizado com sucesso!',
              token,
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                cpf: user.cpf,
                position: user.position,
                role: user.role
              }
            });
    } catch (error) {
        console.error('Erro no login: ', error);
        return res.status(0x1f4).json({ message: 'Erro interno ao realizar login'});
    }
};

// 2. CONFIRMAR CÓDIGO DE ATIVAÇÃO
const verifyActivationCode = async (req, res) => {
  try {
    const { userId, code } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    if (user.status === 'ACTIVE') return res.status(400).json({ message: 'Conta já está ativa' });

    if (user.activationCode !== code || new Date() > new Date(user.activationCodeExpires)) {
      return res.status(400).json({ message: 'Código inválido ou expirado' });
    }

    // Ativa o usuário e limpa o código
    await User.update(userId, {
      status: 'ACTIVE',
      activationCode: null,
      activationCodeExpires: null
    });

    return res.status(200).json({ message: 'Conta ativada com sucesso! Faça login.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 3. SOLICITAR RECUPERAÇÃO DE SENHA (Link expira em 30 min)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(404).json({ message: 'E-mail não encontrado' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    // Atualiza os campos de redefinição no banco
    await User.updateResetToken(user._id, resetToken, resetExpires);

    // Dispara o e-mail de recuperação
    await sendResetPasswordEmail(user.email, resetToken);

    return res.status(200).json({ message: 'E-mail de recuperação enviado com sucesso!' });
  } catch (error) {
    console.error('Erro em forgotPassword:', error);
    return res.status(500).json({ message: error.message || 'Erro ao processar solicitação.' });
  }
};

// 4. RESETAR SENHA ATRAVÉS DO LINK
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ resetPasswordToken: token });

    if (!user || new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({ message: 'Link de recuperação inválido ou expirado (limite de 30 minutos)' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.getCollection().updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      }
    );

    return res.status(200).json({ message: 'Senha alterada com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getDashboardMetrics = async (req, res) => {
  try {
    const db = getDB();

    const totalAthletes = await db.collection('users').countDocuments({ role: 'ATHLETE', active: { $ne: false } });
    const totalWorkouts = await db.collection('workouts').countDocuments();
    const totalConfirmed = await db.collection('attendances').countDocuments({ status: 'CONFIRMED' });

    // Cálculo da taxa: total de presenças divididas pelas oportunidades de presença (Treinos * Atletas)
    const maxPossibleAttendances = totalWorkouts * totalAthletes;
    let attendanceRate = 0;

    if (maxPossibleAttendances > 0) {
      attendanceRate = Math.min(100, Math.round((totalConfirmed / maxPossibleAttendances) * 100));
    }

    return res.status(200).json({
      totalWorkouts,
      totalConfirmed,
      totalAthletes,
      attendanceRate
    });
  } catch (error) {
    console.error('Erro ao buscar métricas do dashboard:', error);
    return res.status(500).json({ message: 'Erro ao carregar dados do dashboard.' });
  }
};

module.exports = { register, login,verifyActivationCode, forgotPassword, resetPassword, getDashboardMetrics};