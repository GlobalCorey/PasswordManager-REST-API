import express = require('express');
import { IRequest, IUserData } from '../common/types';


const jwt = require('jsonwebtoken');
const myJwt = require('../jwt/jwt');

module.exports.jwtMiddleware =  (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const token: string = req.headers.authorization.replace("Bearer ", "");
    myJwt.verifyJWTToken(token)
    .then((data: IUserData) => {
        const userData = {
            email: data.email,
            userId: data.userId
        }
        req.userData = userData;
        next();
    })
    .catch((err: Error) => {
        return res.status(401).json({
            message: err.message
        });
    })
}