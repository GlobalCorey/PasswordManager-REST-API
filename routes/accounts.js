const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account');
const { jwtMiddleware } = require('../middleware/middleware');

//GET all account data
router.get('/accounts', jwtMiddleware, accountController.getAccounts);

//POST new account to account data
router.post('/accounts', jwtMiddleware, accountController.addAccount);

//DELETE an account with a given id
router.delete('/accounts', jwtMiddleware, accountController.deleteAccount);

//PUT change password. Hookup in future.
router.put('/accounts', accountController.changeAccount);

module.exports = router;