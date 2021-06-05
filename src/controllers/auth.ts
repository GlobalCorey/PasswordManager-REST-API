import express = require('express');
import { Token, IUser, IRequest } from '../common/types'; 

// const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const BCRYPT_SALT = 12;
const jwt = require('../jwt/jwt')

exports.currentUser = async(req: IRequest, res: express.Response) => {
    const currentUser: {email: string, userId: string} = req.userData;
    const user: IUser = await checkIfUserExistsById_ThenReturnUserObject(currentUser.userId);

    return res.status(200).json({
        userID: user._id.toString()
    })
}

exports.checkForValidRefreshToken_ThenReturnNewRefreshToken = async (req: IRequest, res: express.Response) => {
    const refreshToken: string = req.body.refreshToken;
    if(!refreshToken){
        return res.status(403).send('Access is forbidden');
    }
    try{
        await getRefreshTokenThenReturnToClient(refreshToken, res);
    }catch(err){
        const message: string = (err && err.message) || err;
        res.status(403).send(message);
    }
}

exports.signup = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    try {
        const email: string = req.body.email;
        const password: string = req.body.password;

        await checkIfUserExistsBeforeContinuingSignup(email);

        const hashedPassword: string = await bcrypt.hash(password, BCRYPT_SALT);
        const newUser: IUser = creatAndReturnNewUser(email, hashedPassword,);
        const newUserSaveResult: IUser = await saveNewUserToDB_ReturnNewUserObject(newUser);
      
        res.status(201).json({
            message: 'New User created',
            userId: newUserSaveResult._id
        })
    } catch (error) {
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.login = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    try {
        const email: string = req.body.email;
        const password: string = req.body.password;

        const user: IUser = await checkIfUserExistsByEmail_ThenReturnUserObject(email);
        
        await checkIfPasswordIsCorrectOnLogin_ThrowErrorIfNot(password, user.password);

        const accessToken: string = jwt.getAccessToken(user.email, user._id.toString());
        const refreshToken: string = await jwt.getRefreshToken(user.email, user._id.toString());

        res.status(200).json({
            userID: user._id.toString(),
            accessToken: accessToken,
            refreshToken: refreshToken
        });
        return;
    } catch (error) {
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
        return error;
    }
}

async function getRefreshTokenThenReturnToClient(refreshToken: string,  res: express.Response): Promise<express.Response>{
    const newTokens: Token = await jwt.refreshTokens(refreshToken);
        return res.status(200).json({
            userID: newTokens.userId,
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken
        })
}

async function checkIfPasswordIsCorrectOnLogin_ThrowErrorIfNot(providedPassword: string, knownPassword: string): Promise<void>{
    const isPasswordCorrect: Promise<boolean> = await bcrypt.compare(providedPassword, knownPassword);
    if(!isPasswordCorrect){
        const error = new Error('Incorrect Email or Password.')
        error.message = "401";
        throw error;
    }
}
function creatAndReturnNewUser(email: string, password: string): IUser {
    const newUser: IUser = new User({
        email: email,
        password: password,
        refreshTokens:[]
    })
    return newUser;
}

async function saveNewUserToDB_ReturnNewUserObject(newUser: IUser): Promise<IUser>{
    const userSaveResult: IUser = await newUser.save();
        if(!userSaveResult){
            const error = new Error('Error occured saving User during Signup!');
            error.message = "422";
            throw error;
        }
    return userSaveResult;
}

async function checkIfUserExistsById_ThenReturnUserObject(id: string): Promise<IUser>{
    const user: IUser = await User.findById(id);
    if(!user){
        const error = new Error('User does not exists.')
        error.message = "401";
        throw error;
    }
    return user;
}

async function checkIfUserExistsByEmail_ThenReturnUserObject(email: string): Promise<IUser>{
    const user: IUser = await User.findOne({email: email});
    if(!user){
        const error = new Error('Email does not exists.')
        error.message = "401";
        throw error;
    }
    return user;
}

async function checkIfUserExistsBeforeContinuingSignup(email: string): Promise<void> {
    const user: IUser = await User.findOne({email: email});
    if(user){
        const error = new Error('Email already exists.')
        error.message = "422";
        throw error;
    }
}
