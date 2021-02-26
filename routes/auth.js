const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/verifyAuth');

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/current-user', authMiddleware, authController.currentUser);

module.exports = router;