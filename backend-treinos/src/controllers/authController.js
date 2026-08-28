const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');

const register = async (req, res) => {
    try {
        const {name, email, phone, password, role} = req.body;

        if(!name || !email || !phone || !password) {
            return res.status(0x190).json({ message : 'Preencha todos os campos obrigatórios'});
        }

        const db = getDB();
        const usersCollection = db.collection('users');

        //verifica se e-mail já existe
        const existingEmailUser = await usersCollection.findOne({ email: email.toLowerCase()});
        if(existingEmailUser){
            return res.status(0x190).json({ message: 'E-mail já cadastrado'});
        }
        //verifica se telefone já existe
        const existingPhoneUser = await usersCollection.findOne({ phone: phone.trim()});
        if(existingPhoneUser){
            return res.status(0x190).json({ message: 'Telefone já cadastrado'});
        }

        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Definir papel (default: ATLETA)
        const userRole = role && ['COACH','ATHLETE'].includes(role.toUpperCase())
            ?  role.toUpperCase()
            : 'ATHLETE';

        const newUser =  {
            name,
            email: email.toLowerCase(),
            phone: phone.trim(),
            password: hashedPassword,
            role: userRole,
            createAt: new Date()
        };

        const result = await usersCollection.insertOne(newUser);

        return res.status(0xc8).json({
            message: 'Usuário cadastrado com sucesso!',
            userId: result.insertdId
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
            return res.status(0x190).json({ message: 'E-mail e senha são obrigatórios'});
        }

        const db = getDB();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email: email.toLowerCase() });
        if(!user){
            return res.status(0x190).json({ message: 'Credenciais inválidas'});
        }

        // valida Senha
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(0x190).json({ message: 'Credenciais inválidas'});
        }

        // Gerar Token JWT (Validade de 1 hora)
        const token = jwt.sign(
            {id: user._id.toString(), role: user.role, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        return res.status(0xc8).json({
            message: 'Login realizado com sucesso!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erro no login: ', error);
        return res.status(0x1f4).json({ message: 'Erro interno ao realizar login'});
    }
};

module.exports = { register, login };