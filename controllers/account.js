const Account = require('../models/account');

exports.getAccounts = async (req, res, next) => {

}

exports.addAccount = async (req, res, next) => {

    const name = req.body.account.name;
    const password = req.body.account.password;

    const newAccount = new Account({
        name: name,
        password: password
    })

    try {
        const accountSaveResult = await newAccount.save();
        if(!accountSaveResult){
            throw new Error('Error saving new Account');
        }

        res.status(201).json({
            acount: newAccount
        })

        return accountSaveResult;

    }catch(err){
        console.log('Error adding account: ', err);
    }

}

exports.deleteAccount = async (req, res, next) => {
    
}