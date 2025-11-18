const usersDB = {
    users:require('../model/users.json'),
    setUsers: function (data) { this.users = data; }
}


const fsPromises = require('fs').promises;
const path = require('path');

//hash password
const bcrypt = require('bcrypt');

const  handleNewUser = async (req, res) => {
    const { user, pwd } = req.body;
    if(!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' }); //400 Bad Request 语法有有误格式不对

    //重复用户名检查
    const duplicate = usersDB.users.find(person => person.username === user);
    if(duplicate) return res.sendStatus(409); //409 Conflict 冲突
    try{
        //密码加密
        const hashedPwd = await bcrypt.hash(pwd, 10); //这个数字 10 是 成本因子 或 salt的轮数。
        const newUser = {"username": user, "password": hashedPwd};
        usersDB.setUsers([...usersDB.users, newUser]);
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'), 
            JSON.stringify(usersDB.users)
        );
        console.log(usersDB.users);
        res.status(201).json({ 'success': `New user ${user} created!` }); //201 Created 成功创建
    }catch(err){
        console.error(err);
        res.status(500).json({'message': err.message}); 
    }
}

module.exports = { handleNewUser };