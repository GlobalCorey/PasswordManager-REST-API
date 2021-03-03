const jwt = require('jsonwebtoken');
const myJwt = require('../jwt/jwt');

module.exports.jwtMiddleware =  (req, res, next) => {
    const token = req.headers.authorization.replace("Bearer ", "");
    console.log("jwtMiddleware ",token);
    myJwt.verifyJWTToken(token)
    .then(data => {
        console.log('.then after verifyJWTToken: ', data);
        const userData = {
            email: data.email,
            userId: data.userId
        }
        console.log('userData in jwtMiddleware: ', userData);
        req.userData = userData;
        next();
    })
    .catch(err => {
        return res.status(401).json({
            message: err.message
        });
    })
}