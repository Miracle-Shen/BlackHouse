
const usersDB = {
    users:require('../model/users.json'),
    setUsers: function (data) { this.users = data; }
}
const fsPromises = require('fs').promises;
const path = require('path');

const handleLogout = async (req, res) => {
    const cookie = req.cookies;
    console.log("cookie:", cookie);
    if(!cookie?.jwt) {
        return res.sendStatus(204); //No Content 无内容
    }
    const foundUser = usersDB.users.find(person => person.refreshToken === cookie.jwt);
    if(!foundUser) {
        res.clearCookie('jwt',{ httpOnly:true, maxAge:24*60*60*1000 });
        return res.sendStatus(204);
    }

    //清除刷新令牌 db
    foundUser.refreshToken = '';

    const otherUsers = usersDB.users.filter(person => person.username !== foundUser.username);
    usersDB.setUsers([...otherUsers, foundUser]);
    await fsPromises.writeFile(
        path.join(__dirname, '..', 'model', 'users.json'), JSON.stringify(usersDB.users)    
    );
    res.clearCookie('jwt', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.sendStatus(204);
}

module.exports = { handleLogout };