const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account');
const authMiddleware = require('../middleware/verifyAuth');
//Add isAuth check later from middleware

//GET all account data
router.get('/accounts', authMiddleware, accountController.getAccounts);

//POST new account to account data
router.post('/accounts', accountController.addAccount);

//DELETE an account with a given id
router.delete('/accounts', accountController.deleteAccount);

//PUT change password
router.put('/accounts', accountController.changeAccount);

module.exports = router;