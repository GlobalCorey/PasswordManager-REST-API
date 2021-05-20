const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account');
const { jwtMiddleware } = require('../middleware/middleware');

router.get('/accounts', jwtMiddleware, accountController.getAccounts);

router.post('/accounts', jwtMiddleware, accountController.addAccount);

router.delete('/accounts', jwtMiddleware, accountController.deleteAccount);

//PUT change password. Hookup in future.
router.put('/accounts', accountController.changeAccount);

module.exports = router;