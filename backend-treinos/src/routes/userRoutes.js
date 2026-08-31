const express = require('express');
const router = express.Router();
const { getAthletes, updateUser } = require('../controllers/userController');
const { verifyToken, verifyCoach } = require('../middleware/auth');

router.use(verifyToken);

// O /api/users já vem definido no app.js
router.get('/', verifyCoach, getAthletes);

router.put('/:id', verifyCoach, updateUser);

module.exports = router;