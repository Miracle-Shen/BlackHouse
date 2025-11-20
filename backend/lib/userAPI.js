const { Client, ID, TablesDB,Query } = require( "appwrite");

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1') // Replace <REGION> with your Appwrite region
    .setProject('691ec46d0011cc0af217'); // BlackHouse Project ID

const tablesDB = new TablesDB(client);

const createUser = async (userId, userName) => {
    try {
        const response = await tablesDB.createRow({
            databaseId: '691ec498000fad4f52be', // Replace with your database ID
            tableId: 'user', // Replace with your table ID
            rowId: ID.unique(),
            data: {
                userId: userId,
                userName: userName,
            },
        });
        console.log("User created successfully:", response);
        return response;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};


const fetchUser =  async (userId) => {
    try {
        const response = await tablesDB.listRows({
            databaseId: '691ec498000fad4f52be', 
            tableId: 'user',
            queries: [
                Query.equal('userId', userId)
            ]
        });
        return response;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
};

const fetchTags =  async (userId) => {
    try {
        const response = await tablesDB.listRows({
            databaseId: '691ec498000fad4f52be', 
            tableId: 'user_tag',
            queries: [
                Query.equal('userId', userId)
            ]
        });
        return response;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
};

module.exports = { createUser, fetchUser, fetchTags };




