const express = require('express');
const router = express.Router();
const {
    createForm,
    getForms,
    getFormById,
    deleteForm,
    updateForm
} = require('../controllers/formController');
const { verifyToken, verifyCoach } = require('../middleware/auth');

// Todas as rotas exigem token
router.use(verifyToken);

// Atletas e Coaches podem buscar um form específico pelo ID (para preencher)
router.get('/:id', getFormById);

// Apenas COACH pode listar, criar e deletar formulários
router.get('/', verifyCoach, getForms);
router.put('/:id', verifyCoach, updateForm);
router.post('/', verifyCoach, createForm);
router.delete('/:id', verifyCoach, deleteForm);

module.exports = router;