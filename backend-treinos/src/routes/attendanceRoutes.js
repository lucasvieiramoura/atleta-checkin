const express = require('express');
const router = express.Router();
const { checkIn, getWorkoutAttendance } = require('../controllers/attendancecController');
const { verifyToken, verifyCoach } = require('../middleware/auth');

router.use(verifyToken);

// Atletas confirmam presença
router.post('/checkin', checkIn);

// Coaches visualizam a lista de chamda de um treino especifico
router.get('/workout/:workoutId', verifyCoach, getWorkoutAttendance);

module.exports = router;