
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
require('dotenv').config();
const fsPromises = require('fs').promises;

const usersDB = {
    get users() {
        // 每次访问时实时读取文件，避免缓存问题
        const data = fs.readFileSync(path.join(__dirname, '../model/users.json'), 'utf-8');
        return JSON.parse(data);
    },
    setUsers: function (data) { 
        fs.writeFileSync(path.join(__dirname, '../model/users.json'), JSON.stringify(data, null, 2));
    }
};
const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    console.log(user,pwd);
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    const foundUser = usersDB.users.find(person => person.username === user);

        console.log("foundUser:", foundUser);
    if (!foundUser) return res.status(401).json({ 'message': '未注册用户' }); //Unauthorized 未授权

    //密码验证
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
        //JWT
        const accessToken = JWT.sign(
            {"username": foundUser.username},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:'30s'}
        );
        const refreshToken = JWT.sign(
            {"username": foundUser.username},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn:'15d'}
        );
        //保存刷新令牌
        const otherUsers = usersDB.users.filter(person => person.username !== foundUser.username);
        const currentUser = {...foundUser, refreshToken};
        usersDB.setUsers([...otherUsers,currentUser]);
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'), 
            JSON.stringify(usersDB.users)
        );
        console.log(usersDB.users);
        res.cookie('jwt',refreshToken,{ httpOnly:true, maxAge:24*60*60*1000 }); //secure:true 仅https
        res.status(200).json({ 'message': `User ${user} logged in!`, accessToken });
    } else {
        res.sendStatus(401);
    }
}

module.exports = { handleLogin };