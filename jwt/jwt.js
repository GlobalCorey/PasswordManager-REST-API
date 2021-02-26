const jwt = require('jsonwebtoken');

module.exports.getAccessToken = (email, userID) => {
    const token = jwt.sign({
        email: email,
        userId: userID
    }, 
    `${process.env.JWT_SECRET_TOKEN}`, 
    {expiresIn: '15m'})

    return token;
};

module.exports.getRefreshToken = (data) => {
    //Access DB to check if there is a refresh token

    //Check if there are 5 or more refresh tokens.
    // If so, remove all but the latest refresh token for security reasons

    //Sign refresh token
    
    //Push new refresh token to DB
};