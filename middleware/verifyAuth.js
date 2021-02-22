const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.replace("Bearer ", "");
        console.log("auth middleware hit!!! ",token);
        const decode = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        
        req.userData = decode;
        next();
    }catch(err){
        return res.status(401).json({
            message: "Authentication Failed"
        });
    }
};