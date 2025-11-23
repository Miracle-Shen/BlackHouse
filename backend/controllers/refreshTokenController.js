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
    console.log("Received refreshToken:", refreshToken);

    const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
    if (!foundUser) {
        console.log("No matching user found for refreshToken");
        return res.status(403).json({ 'message': 'foundUser Forbidden' }); //禁止访问
    }

    console.log("Found user:", foundUser);

    //密码验证
    JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || foundUser.username !== decoded.username) {
                console.log("JWT verification failed or username mismatch:", err);
                return res.status(403).json({ 'message': `${err}` }); //禁止访问
            }
            console.log("JWT verified successfully. Decoded username:", decoded.username);

            const accessToken = JWT.sign(
                {"username": decoded.username},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn:'30s'}
            );
            console.log("Generated new accessToken:", accessToken);

            res.status(200).json({ accessToken });
        }
    );
}

module.exports = { handleRefreshToken };