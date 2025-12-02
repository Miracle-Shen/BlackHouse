const uploadFile = require('../lib/fileAPI').uploadFile;
const {fetchUser, fetchTags} = require('../lib/userAPI.js');
const fs = require('fs');
const path = require('path');
const { fetchFile } = require('../lib/fileAPI.js');

const usersDB = {
    get users() {
        const data = fs.readFileSync(path.join(__dirname, '../model/users.json'), 'utf-8');
        return JSON.parse(data);
    },
    setUsers: function (data) { 
        fs.writeFileSync(path.join(__dirname, '../model/users.json'), JSON.stringify(data, null, 2));
    }
};


const handleUpload = async (req, res) => {
    console.log("Handling file upload request");
    const cookie = req.cookies;
    if(!cookie?.jwt) {
        return res.status(401).json({message: "No jwt"}); //Unauthorized 未授权
    }
    console.log("jwt:", cookie.jwt);
    const foundUser = usersDB.users.find(person => person.refreshToken === cookie.jwt);
    if(!foundUser) {
        return res.status(403).json({message: "No matching user found"}); //Forbidden 禁止访问
    }
    const fileURL  = req.file;

    console.log("fileURL:", fileURL);
    if (!fileURL) return res.status(400).json({ 'message': 'fileURL is required.' });


    //文件上传逻辑待实现
    await uploadFile(fileURL,res);
}

module.exports = { handleUpload };