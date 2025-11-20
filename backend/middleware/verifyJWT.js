const JWT = require('jsonwebtoken');
require('dotenv').config();

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log("authHeader:", authHeader);
    if(!authHeader) return res.sendStatus(401); //未授权
    console.log(authHeader);
    const token = authHeader.split(' ')[1];
    JWT.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err) return res.sendStatus(403); //禁止访问
            req.user = decoded.username;
            next();
        }
    );
}

module.exports = verifyJWT;