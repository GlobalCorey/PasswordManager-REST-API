const Account = require('../models/account');

exports.getAccounts = async (req, res) => {
    const currentUserID = req.userData.userId;
    const accounts = await Account.find({userID: currentUserID});
    if(!accounts){
        const error = new Error('Accounts not found!');
        error.statusCode = 404;
        throw error
    }

    res.status(200).json({
        accounts: accounts
    });
}

exports.addAccount = async (req, res) => {
    const userID = req.userData.userId
    const name = req.body.account.name;
    const password = req.body.account.password;
    
    const newAccount = new Account({
        userID: userID,
        name: name,
        password: password
    })

    try {
        await checkIfAccountInfoAlreadyExistsByName(name, userID, res);
       
        const accountSaveResult = await newAccount.save();
        if(!accountSaveResult){
            throw new Error('Error saving new Account');
        }

        res.status(201).json({
            account: newAccount,
            message: 'Success in adding account!'
        })

        return accountSaveResult;

    }catch(err){
        console.log('Error adding account: ', err);
    }
}


exports.changeAccount = async (req, res) => {
    const name = req.body.account.name;
    const newPassword = req.body.account.password;

    try {
        //TODO
        //Should change this to use the account._id instead of the name
        const updatedAccount = await findAccountByNameAndUpdatePassword(name, newPassword);

        res.status(201).json({
            account: updatedAccount,
            message: 'Success in updating account!'
        })

        return updatedAccount;

    }catch(err){
        console.log('Error updating account: ', err);
    }
}

exports.deleteAccount = async (req, res) => {
    const accountID = req.query.id
    const accountToDelete = await findAccountByIdAndDelete_ThenReturnDeletedAccountName(accountID);

    res.status(200).json({
        message: `Account:  ${accountToDelete.name} deleted!`
    });
}

checkIfAccountInfoAlreadyExistsByName = async (name, userID, res) => {
    const doesAccountExist = await Account.findOne({name: name, userID: userID});
    if(doesAccountExist){
        const error = new Error('Account info already exists.')
        error.statusCode = 422;
        res.status(406).send(error.message);
        throw error;
    }
}

findAccountByNameAndUpdatePassword = async (name, newPassword) => {
    const updatedAccount = await Account.findOneAndUpdate({name: name}, {password: newPassword}, {new: true});
        if(!updatedAccount){
            throw new Error('Error updating Account');
        }
        return updatedAccount;
}

findAccountByIdAndDelete_ThenReturnDeletedAccountName = async (id) => {
    const accountToDelete = await Account.findByIdAndDelete(id);
    if(!accountToDelete){
        const error = new Error('Account id: ', id, ' not found!');
        error.statusCode = 404;
        throw error;
    }
    return accountToDelete
}