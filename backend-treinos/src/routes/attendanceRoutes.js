const express = require('express');
const router = express.Router();
const { checkIn, getWorkoutAttendance, getDashboardMetrics} = require('../controllers/attendancecController');
const { verifyToken, verifyCoach } = require('../middleware/auth');

router.use(verifyToken);

// Atletas confirmam presença
router.post('/checkin', checkIn);

// Coaches visualizam a lista de chamda de um treino especifico
router.get('/workout/:workoutId', verifyCoach, getWorkoutAttendance);


// GET /api/attendance/dashboard
router.get('/dashboard', getDashboardMetrics);

module.exports = router;