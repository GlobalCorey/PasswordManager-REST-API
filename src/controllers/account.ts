import express = require('express');
import { IAccount, IRequest } from '../common/types'

const Account = require('../models/account');

exports.getAccounts = async (req: IRequest, res: express.Response) => {
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

exports.addAccount = async (req: IRequest, res: express.Response) => {
    const userID: string = req.userData.userId
    const name: string = req.body.account.name;
    const password: string = req.body.account.password;
    
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

        res.status(201).json({
            account: newAccount,
            message: 'Success in adding account!'
        })

        return accountSaveResult;

    }catch(err){
        console.log('Error adding account: ', err);
    }
}


exports.changeAccountPassword = async (req: IRequest, res: express.Response) => {
    const name: string = req.body.account.name;
    const newPassword: string = req.body.account.password;

    try {
        //TODO
        //Should change this to use the account._id instead of the name
        const updatedAccount: IAccount = await findAccountByNameAndUpdatePassword(name, newPassword);

        res.status(201).json({
            account: updatedAccount,
            message: 'Success in updating account!'
        })

        return updatedAccount;

    }catch(err){
        console.log('Error updating account: ', err);
    }
}

exports.deleteAccount = async (req: IRequest, res: express.Response) => {
    const accountID: string = req.query.id
    const accountToDelete: IAccount = await findAccountByIdAndDelete_ThenReturnDeletedAccountName(accountID);

    res.status(200).json({
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

async function findAccountByNameAndUpdatePassword(name: string, newPassword: string): Promise<IAccount>{
    const updatedAccount: IAccount = await Account.findOneAndUpdate({name: name}, {password: newPassword}, {new: true});
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