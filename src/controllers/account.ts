import express = require('express');
import { IAccount, IRequest } from '../common/types'

const Account = require('../models/account');

exports.getAccounts = async (req: IRequest, res: express.Response): Promise<void> => {
    const currentUserID: string = req.userData.userId;
    const accounts: IAccount[] = await Account.find({userID: currentUserID});
    if(!accounts){
        const error = new Error('Accounts not found!');
        error.message = "404";
        throw error
    }

    res.status(200).json({
        accounts: accounts
    });
}

//Look for run time error with adding the same account info across different login credentials.
//First attempt to add account info does nothing. Logging out/in then repeating yields the correct behavior.
exports.addAccount = async (req: IRequest, res: express.Response): Promise<express.Response | Error> => {
    const userID: string = req.userData.userId
    const { name, password } = req.body.account;
    
    const newAccount: IAccount = new Account({
        userID: userID,
        name: name,
        password: password
    })

    try {
        await checkIfAccountInfoAlreadyExistsByName(name, userID, res);
       
        const accountSaveResult: IAccount = await newAccount.save();
        if(!accountSaveResult){
            throw new Error('Error saving new Account');
        }

        return res.status(201).json({
            account: accountSaveResult,
            message: 'Success in adding account!'
        });
        
    }catch(err){
        console.log('Error adding account: ', err);
        return err;
    }
}

exports.changeAccountPassword = async (req: IRequest, res: express.Response): Promise<express.Response | Error> => {
    const userID: string = req.userData.userId
    const { password: newPassword } = req.body.account;

    try {
        const updatedAccount: IAccount = await findAccountByIDAndUpdatePassword(userID, newPassword);
        return res.status(201).json({
            account: updatedAccount,
            message: 'Success in updating account!'
        })
    }catch(err){
        console.log('Error updating account: ', err);
        return err;
    }
}

exports.deleteAccount = async (req: IRequest, res: express.Response): Promise<express.Response> => {
    const accountID: string = req.query.id
    const accountToDelete: IAccount = await findAccountByIdAndDelete_ThenReturnDeletedAccountName(accountID);

    return  res.status(200).json({
        message: `Account:  ${accountToDelete.name} deleted!`
    });
}

async function checkIfAccountInfoAlreadyExistsByName(name: string, userID: string, res: express.Response): Promise<void>{
    const doesAccountExist: IAccount = await Account.findOne({name: name, userID: userID});
    if(doesAccountExist){
        const error = new Error('Account info already exists.')
        error.message = "422";
        res.status(406).send(error.message);
        throw error;
    }
}

async function findAccountByIDAndUpdatePassword(ID: string, newPassword: string): Promise<IAccount>{
    const updatedAccount: IAccount = await Account.findOneAndUpdate({_id: ID}, {password: newPassword}, {new: true});
        if(!updatedAccount){
            throw new Error('Error updating Account');
        }
        return updatedAccount;
}

async function findAccountByIdAndDelete_ThenReturnDeletedAccountName(id: string): Promise<IAccount>{
    const accountToDelete: IAccount = await Account.findByIdAndDelete(id);
    if(!accountToDelete){
        const error = new Error(`Account id: ${id} not found!`);
        error.message = "404";
        throw error;
    }
    return accountToDelete
}