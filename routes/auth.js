const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { jwtMiddleware } = require('../middleware/middleware');

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/current-user', jwtMiddleware, authController.currentUser);

router.post('/refresh-token', authController.refreshToken);

module.exports = router;