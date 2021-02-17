const Account = require('../models/account');

exports.getAccounts = async (req, res, next) => {
    console.log('getAccounts Hit')
    const accounts = await Account.find();
    if(!accounts){
        const error = new Error('Accounts not found!');
        error.statusCode = 404;
        throw error
    }

    res.status(200).json({
        accounts: accounts
    });
}

exports.addAccount = async (req, res, next) => {
    console.log('addAccount hit')
    const name = req.body.account.name;
    const password = req.body.account.password;
    
    const newAccount = new Account({
        name: name,
        password: password
    })

    try {
        const doesAccountExist = await Account.findOne({name: name});
        if(doesAccountExist){
            const error = new Error('Account info already exists.')
            error.statusCode = 422;
            throw error;
        }

        const accountSaveResult = await newAccount.save();
        if(!accountSaveResult){
            throw new Error('Error saving new Account');
        }

        res.status(201).json({
            acount: newAccount,
            message: 'Success in adding account!'
        })

        return accountSaveResult;

    }catch(err){
        console.log('Error adding account: ', err);
    }
}

exports.changeAccount = async (req, res, next) => {
    console.log('Change password info and stuff.')
    const name = req.body.account.name;
    const newPassword = req.body.account.password;

    try {
        const doesAccountExist = await Account.findOne({name: name});
        if(!doesAccountExist){
            const error = new Error('Account info does not exists.')
            error.statusCode = 404;
            throw error;
        }

        const updatedAccount = await Account.findOneAndUpdate({name: name}, {password: newPassword}, {new: true});
        if(!updatedAccount){
            throw new Error('Error updating Account');
        }

        res.status(201).json({
            acount: updatedAccount,
            message: 'Success in updating account!'
        })

        return updatedAccount;

    }catch(err){
        console.log('Error updating account: ', err);
    }
}

exports.deleteAccount = async (req, res, next) => {
    const accountID = req.query.id
    console.log('deleteAccount hit: ', accountID);
    const accountToDelete = await Account.findByIdAndDelete(accountID);
    console.log('accountToDelet: ', accountToDelete);
    if(!accountToDelete){
        const error = new Error('Account id: ', req.body.id, ' not found!');
        error.statusCode = 404;
        throw error;
    }

    res.status(200).json({
        message: `Account:  ${accountToDelete.name} deleted!`
    });
}