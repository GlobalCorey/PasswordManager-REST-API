const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const BCRYPT_SALT = 12;
const jwt = require('../jwt/jwt')

//Need to add new endpoint to get the current user if the 
// session is still valid

exports.currentUser = async(req, res, next) => {
    const currentUser = req.userData;

    const user = await User.findById(currentUser.userId);
    if(!user){
        const error = new Error('User does not exists.')
        error.statusCode = 401;
        throw error;
    }

    //Add getRefreshToken functionality to the JWT file
    const token = jwt.getAccessToken(user.email, user._id.toString());

    res.status(200).json({
        token: token,
        userID: user._id.toString()
    })
    return;
}

exports.signup = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({email: email});
        if(user){
            const error = new Error('Email already exists.')
            error.statusCode = 422;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT);
        const newUser = new User({
            email: email,
            password: hashedPassword
        })

        const userSaveResult = await newUser.save();
        if(!userSaveResult){
            const error = new Error('Error occured saving User during Signup!');
            error.statusCode = 422;
            throw error;
        }
        res.status(201).json({
            message: 'New User created',
            userId: userSaveResult._id
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
        console.log('email: ', email, '\npassword: ', password);

        const user = await User.findOne({email: email});
        if(!user){
            const error = new Error('Email does not exists.')
            error.statusCode = 401;
            throw error;
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            const error = new Error('Incorrect Email or Password.')
            error.statusCode = 401;
            throw error;
        }

        //Add getRefreshToken functionality to the JWT file
        const token = jwt.getAccessToken(user.email, user._id.toString());

        res.status(200).json({
            token: token,
            userID: user._id.toString()
        })
        return;
        
    } catch (error) {
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
        return error;
    }
}