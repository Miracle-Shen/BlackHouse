const JWT = require('jsonwebtoken');
require('dotenv').config();

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;//req.headers['authorization'];
    console.log("req authHeader:", authHeader);
    if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401); //未授权
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