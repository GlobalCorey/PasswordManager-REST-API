const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account');
//account controllers import here
//Add isAuth check later from middleware

//GET all account data
router.get('/accounts', accountController.getAccounts);

//POST new account to account data
router.post('/accounts', accountController.addAccount);

//DELETE an account with a given id

//PUT change password?

module.exports = router;