const express = require('express');
const router = express.Router();
const { 
    createWorkout,
    getWorkouts,
    getWorkoutById,
    getTodayWorkout,
    doCheckin,
    deleteWorkout
} = require('../controllers/workoutController');
const { verifyToken, verifyCoach } = require('../middleware/auth');

// Rotas protegidas ( Requer Token JWT)
router.use(verifyToken);

// Atletas e Coaches podem listar e visualizar treinos
router.get('/', getWorkouts);
router.get('/today', getTodayWorkout);
router.get('/:id', getWorkoutById);

// Apenas COACH pode criar e remover treinos
router.post('/', verifyCoach, createWorkout);
router.post('/', doCheckin);
router.delete('/:id', verifyCoach, deleteWorkout);

module.exports = router;