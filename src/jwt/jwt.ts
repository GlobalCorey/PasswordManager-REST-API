import { Token } from '../common/types'

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyJWTToken = (token: string) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err: Error, decodedToken: Token) => {
            if(err){
                return reject(err.message);
            }
            
            if(!decodedToken || !decodedToken.userId){
                return reject('Token is invalid. Decode error.')
            }
            resolve(decodedToken);
        })
    })
};

const getAccessToken = (email: string, userID: string) => {
    return jwt.sign({
        email: email,
        userId: userID
    }, 
    `${process.env.JWT_SECRET_TOKEN}`, 
    {expiresIn: '1m'})
};

const getRefreshToken = async (email: string, userID: string) => {
    const user = await checkIfUserExists_ThenReturnUserObject(userID)
    
    let newRefreshTokens: string[] = user.refreshTokens.map((token: string) =>{ return token});
    if(newRefreshTokens.length >= 5){
        newRefreshTokens = filterOutOldRefreshTokensFromUserObject_ThenReturnFilteredRefreshTokens(newRefreshTokens, userID);
    }

    const refreshToken = createNewRefreshToken(email, userID);
    newRefreshTokens.push(refreshToken);

    await findUserDocById_ThenPushNewRefreshTokensToUser(userID, newRefreshTokens);
    
    return refreshToken;
};

const checkRefreshTokenForValidity_ReturnNewRefreshTokenIfValid = async (token: string) => {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    
    const user = await User.findOne({_id: decodedToken.userId})
    if(!user){
        throw new Error('User does not exist.');
    }

    const refreshTokens = user.refreshTokens;
    if(refreshTokens.length === 0){
        throw new Error('No refresh tokens for this user.');
    }

    const currentRefreshToken = refreshTokens.find((refreshToken: string) => refreshToken === token);
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

async function findUserDocById_ThenPushNewRefreshTokensToUser(userID: string, newRefreshTokens: string[]){
    const updateRefreshTokens = await User.findByIdAndUpdate(userID, {refreshTokens: newRefreshTokens});
    if(!updateRefreshTokens){
        const error = new Error('Error updating refresh tokens.')
        error.message = "401";
        throw error;
    }
}

function createNewRefreshToken(email: string, userID: string){
    const refreshToken = jwt.sign({
        email: email,
        userId: userID
    },
    `${process.env.JWT_SECRET_TOKEN}`,
    {expiresIn: '5d'});

    return refreshToken
}

function filterOutOldRefreshTokensFromUserObject_ThenReturnFilteredRefreshTokens(oldRefreshTokens: string[], userID: string){
    const newRefreshTokens =  oldRefreshTokens.filter(token => {
        console.log('before jwt.verify call')
        //Need to re-do this bit to handle expired tokens correctly
        jwt.verify(token, process.env.JWT_SECRET_TOKEN).userId !== userID
    });
    console.log('newRefreshTokens filtered: ', newRefreshTokens)
    return newRefreshTokens;
}

async function checkIfUserExists_ThenReturnUserObject(id: string){
    const user = await User.findOne({_id: id})
    if(!user){
        const error = new Error('User does not exist')
        error.message = "401";
        throw error;
    }
    return user;
}

module.exports = {
    verifyJWTToken: verifyJWTToken,
    getAccessToken: getAccessToken,
    getRefreshToken: getRefreshToken,
    refreshTokens: checkRefreshTokenForValidity_ReturnNewRefreshTokenIfValid
}