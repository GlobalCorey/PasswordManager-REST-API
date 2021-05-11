const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const BCRYPT_SALT = 12;
const jwt = require('../jwt/jwt')

exports.currentUser = async(req, res, next) => {
    const currentUser = req.userData;
    const user = await checkIfUserExistsById_ThenReturnUserObject(currentUser.userId);

    return res.status(200).json({
        userID: user._id.toString()
    })
}

exports.checkForValidRefreshToken_ThenReturnNewRefreshToken = async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if(!refreshToken){
        return res.status(403).send('Access is forbidden');
    }
    try{
        await getRefreshTokenThenReturnToClient(refreshToken);
    }catch(err){
        const message = (err && err.message) || err;
        res.status(403).send(message);
    }
}

exports.signup = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        await checkIfUserExistsBeforeContinuingSignup(email);

        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT);
        const newUser = creatAndReturnNewUser(email, hashedPassword,);
        const newUserSaveResult = await saveNewUserToDB_ReturnNewUserObject(newUser);
      
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

exports.login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await checkIfUserExistsByEmail_ThenReturnUserObject(email);
        
        await checkIfPasswordIsCorrectOnLogin_ThrowErrorIfNot(password, user.password);

        const accessToken = jwt.getAccessToken(user.email, user._id.toString());
        const refreshToken = await jwt.getRefreshToken(user.email, user._id.toString());

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

getRefreshTokenThenReturnToClient = async (refreshToken) => {
    const newTokens = await jwt.refreshTokens(refreshToken);
        return res.status(200).json({
            userID: newTokens.userId,
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken
        })
}

checkIfPasswordIsCorrectOnLogin_ThrowErrorIfNot = async (providedPassword, knownPassword) =>{
    const isPasswordCorrect = await bcrypt.compare(providedPassword, knownPassword);
    if(!isPasswordCorrect){
        const error = new Error('Incorrect Email or Password.')
        error.statusCode = 401;
        throw error;
    }
}

creatAndReturnNewUser = (email, password) => {
    const newUser = new User({
        email: email,
        password: password,
        refreshTokens:[]
    })
    return newUser;
}

saveNewUserToDB_ReturnNewUserObject = async (newUser) => {
    const userSaveResult = await newUser.save();
        if(!userSaveResult){
            const error = new Error('Error occured saving User during Signup!');
            error.statusCode = 422;
            throw error;
        }
    return userSaveResult;
}

checkIfUserExistsById_ThenReturnUserObject = async (id) => {
    const user = await User.findById(id);
    if(!user){
        const error = new Error('User does not exists.')
        error.statusCode = 401;
        throw error;
    }
    return user;
}

checkIfUserExistsByEmail_ThenReturnUserObject = async (email) => {
    const user = await User.findOne({email: email});
    if(!user){
        const error = new Error('Email does not exists.')
        error.statusCode = 401;
        throw error;
    }
    return user;
}

checkIfUserExistsBeforeContinuingSignup = async (email) => {
    const user = await User.findOne({email: email});
    if(user){
        const error = new Error('Email already exists.')
        error.statusCode = 422;
        throw error;
    }
}
