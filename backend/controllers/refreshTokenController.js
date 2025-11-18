
const usersDB = {
    users:require('../model/users.json'),
    setUsers: function (data) { this.users = data; }
}

const JWT = require('jsonwebtoken');
require('dotenv').config();

const handleRefreshToken =  (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.jwt) return res.status(401);
    const refreshToken = cookie.jwt;
    const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
    if (!foundUser) return res.sendStatus(403); //禁止访问

    //密码验证
    JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || foundUser.username !== decoded.username) return res.sendStatus(403);' //禁止访问'
            const accessToken = JWT.sign(
                {"username": decoded.username},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn:'30s'}
            );
            res.status(200).json({ accessToken });
        }
    );
}

module.exports = { handleRefreshToken };