const express = require('express');
const router = express.Router();
const { 
    createWorkout,
    getWorkouts,
    getWorkoutById,
    deleteWorkout
} = require('../controllers/workoutController');
const { verifyToken, verifyCoach } = require('../middleware/auth');

// Rotas protegidas ( Requer Token JWT)
router.use(verifyToken);

// Atletas e Coaches podem listar e visualizar treinos
router.get('/', getWorkouts);
router.get('/:id', getWorkoutById);

// Apenas COACH pode criar e remover treinos
router.post('/', verifyCoach, createWorkout);
router.delete('/:id', verifyCoach, deleteWorkout);

module.exports = router;