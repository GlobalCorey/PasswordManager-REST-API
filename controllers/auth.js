const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const BCRYPT_SALT = 12;
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    try {
        console.log('Hit signup!!!!!!!')

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

        const token = jwt.sign({
            email: user.email,
            userId: user._id.toString()
        }, 
        `${process.env.JWT_SECRET_TOKEN}`, 
        {expiresIn: '1h'})
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