const jwt = require('jsonwebtoken');
const User = require('../models/user');
// const uuidv1 = require('uuidv1');

const verifyJWTToken = (token) => {
    console.log('verifyJWTToken');
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, decodedToken) => {
            //If some kind of error with the signature or expiration, return error
            if(err){
                return reject(err.message);
            }
            // console.log('decodedToken: ', decodedToken);
            
            if(!decodedToken || !decodedToken.userId){
                // console.log('decodedToken: ', decodedToken);
                return reject('Token is invalid. Decode error.')
            }
            resolve(decodedToken);
        })
    })
};

const getAccessToken = (email, userID) => {
    return jwt.sign({
        email: email,
        userId: userID
    }, 
    `${process.env.JWT_SECRET_TOKEN}`, 
    {expiresIn: '1m'})
};

const getRefreshToken = async (email, userID) => {
    //Access DB to check if there is a refresh token
    const user = await User.findOne({_id: userID})
    if(!user){
        const error = new Error('User does not exist')
        error.statusCode = 401;
        throw error;
    }
    //Check if there are 5 or more refresh tokens.
    // If so, remove all but the latest refresh token for security reasons
    //Create new array of refresh tokens as to not mutate data in place
    let newRefreshTokens = user.refreshTokens.map(token =>{ return token});
    if(user.refreshTokens.length >= 5){
        newRefreshTokens =  user.refreshTokens.filter(token => {
            jwt.verify(token, process.env.JWT_SECRET_TOKEN).userId !== userID
        });
    }

    //Sign refresh token
    const refreshToken = jwt.sign({
        email: email,
        userId: userID
    },
    `${process.env.JWT_SECRET_TOKEN}`,
    {expiresIn: '5d'});
    
    //Push new refresh token to DB
    newRefreshTokens.push(refreshToken);

    const updateRefreshTokens = await User.findByIdAndUpdate(userID, {refreshTokens: newRefreshTokens});
    if(!updateRefreshTokens){
        const error = new Error('Error updating refresh tokens.')
        error.statusCode = 401;
        throw error;
    }
    
    return refreshToken;
};

const refreshTokens = async (token) => {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    
    //Check for user
    const user = await User.findOne({_id: decodedToken.userId})
    if(!user){
        throw new Error('User does not exist.');
    }
    //Check if user has refresh tokens
    const refreshTokens = user.refreshTokens;
    if(refreshTokens.length === 0){
        throw new Error('No refresh tokens for this user.');
    }
    //Check if the refresh token we provide matches one in the refresh token array
    const currentRefreshToken = refreshTokens.find(refreshToken => refreshToken === token);
    if(!currentRefreshToken){
        throw new Error('Refresh token is wrong');
    }

    const payload = {
        email: user.email,
        userId: user._id.toString()
    }

    const newAccessToken = getAccessToken(payload.email, payload.userId);
    const newRefreshToken = await getRefreshToken(payload.email, payload.userId);

    return {
        userId: user._id.toString(),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    }
}

module.exports = {
    verifyJWTToken: verifyJWTToken,
    getAccessToken: getAccessToken,
    getRefreshToken: getRefreshToken,
    refreshTokens: refreshTokens
}