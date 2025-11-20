const {fetchUser, fetchTags} = require('../lib/userAPI.js');
const fs = require('fs');
const path = require('path');

const usersDB = {
    get users() {
        const data = fs.readFileSync(path.join(__dirname, '../model/users.json'), 'utf-8');
        return JSON.parse(data);
    },
    setUsers: function (data) { 
        fs.writeFileSync(path.join(__dirname, '../model/users.json'), JSON.stringify(data, null, 2));
    }
};
const getUserInfo = async (req, res) => {
    const cookie = req.cookies;
    console.log("cookie:", cookie);
    if(!cookie?.jwt) {
        return res.status(401).json({message: "No jwt"}); //Unauthorized 未授权
    }
    console.log("jwt:", cookie.jwt);
    const foundUser = usersDB.users.find(person => person.refreshToken === cookie.jwt);

    if(!foundUser) {
        return res.status(403).json({message: "No matching user found"}); //Forbidden 禁止访问
    }
    const userId = foundUser.userId;
    console.log("foundUser:", userId);
    try {
        const userResponse = await fetchUser(userId); 
        console.log("userResponse:", userResponse);
        if (userResponse.total === 0) {
            return res.status(404).json({ 'message': 'User not found.' });
        }
        const user = userResponse.rows[0];

        const tagsResponse = await fetchTags(userId);
        let tags;
        if (tagsResponse.total !== 0) {
            tags = tagsResponse.rows[0].map(doc => doc.interest_tags).flat();   
        }
        const userInfo = {
            userName: user.userName,
            interestTags: tags || " "
        };
        return res.status(200).json(userInfo);
    } catch (error) {
        console.error("Error fetching user info:", error);
        return res.status(500).json({ 'message': 'Internal server error.' });
    }
};

module.exports = { getUserInfo };