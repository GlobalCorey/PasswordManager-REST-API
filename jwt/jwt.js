const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyJWTToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, decodedToken) => {
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

const getAccessToken = (email, userID) => {
    return jwt.sign({
        email: email,
        userId: userID
    }, 
    `${process.env.JWT_SECRET_TOKEN}`, 
    {expiresIn: '1m'})
};

const getRefreshToken = async (email, userID) => {
    const user = await checkIfUserExists_ThenReturnUserObject(userID)
    
    let newRefreshTokens = user.refreshTokens.map(token =>{ return token});
    if(newRefreshTokens >= 5){
        newRefreshTokens = filterOutOldRefreshTokensFromUserObject_ThenReturnFilteredRefreshTokens(newRefreshTokens);
    }

    const refreshToken = createNewRefreshToken(email, userID);
    newRefreshTokens.push(refreshToken);

    findUserDocById_ThenPushNewRefreshTokensToUser(userID, newRefreshTokens);
    
    return refreshToken;
};

const checkRefreshTokenForValidity_ReturnNewRefreshTokenIfValid = async (token) => {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    
    const user = await User.findOne({_id: decodedToken.userId})
    if(!user){
        throw new Error('User does not exist.');
    }

    const refreshTokens = user.refreshTokens;
    if(refreshTokens.length === 0){
        throw new Error('No refresh tokens for this user.');
    }

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

findUserDocById_ThenPushNewRefreshTokensToUser = async (userID, newRefreshTokens) => {
    const updateRefreshTokens = await User.findByIdAndUpdate(userID, {refreshTokens: newRefreshTokens});
    if(!updateRefreshTokens){
        const error = new Error('Error updating refresh tokens.')
        error.statusCode = 401;
        throw error;
    }
}

createNewRefreshToken = (email, userID) => {
    const refreshToken = jwt.sign({
        email: email,
        userId: userID
    },
    `${process.env.JWT_SECRET_TOKEN}`,
    {expiresIn: '5d'});

    return refreshToken
}

filterOutOldRefreshTokensFromUserObject_ThenReturnFilteredRefreshTokens = (oldRefreshTokens) => {
    newRefreshTokens =  oldRefreshTokens.filter(token => {
        jwt.verify(token, process.env.JWT_SECRET_TOKEN).userId !== userID
    });
    return newRefreshTokens;
}

checkIfUserExists_ThenReturnUserObject = async (id) =>{
    const user = await User.findOne({_id: id})
    if(!user){
        const error = new Error('User does not exist')
        error.statusCode = 401;
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