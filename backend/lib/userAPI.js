const { Client, ID, Databases,Query } = require( "appwrite");
const dotenv = require('dotenv');
dotenv.config();
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT) // Replace <REGION> with your Appwrite region
    .setProject(process.env.APPWRITE_PROJECT_ID); // BlackHouse Project ID

// const tablesDB = new TablesDB(client);
const databases = new Databases(client);
const createUser = async (userId, userName) => {
    try {
        const response = await databases.createDocument(
            process.env.DATABASE_ID, // Replace with your database ID
            'user', // Replace with your table ID
            ID.unique(),
            {
                userId: userId,
                userName: userName,
            },
        );
        console.log("User created successfully:", response);
        return response;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};


// const fetchUser =  async (userId) => {
//     try {
//         const response = await tablesDB.listRows({
//             databaseId: process.env.DATABASE_ID,
//             tableId: 'user',
//             queries: [
//                 Query.equal('userId', userId)
//             ]
//         });
//         return response;
//     } catch (error) {
//         console.error("Error fetching user:", error);
//         throw error;
//     }
// };
// ============================== GET USER BY ID
async function fetchUser(userId) {
  try {
    const user = await databases.getDocument(
       process.env.DATABASE_ID,
      'user',
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}
// const fetchTags =  async (userId) => {
//     try {
//         const response = await databases.listRows({
//             databaseId:  process.env.DATABASE_ID,
//             tableId: 'user_tag',
//             queries: [
//                 Query.equal('userId', userId)
//             ]
//         });
//         return response;
//     } catch (error) {
//         console.error("Error fetching user:", error);
//         throw error;
//     }
// };

module.exports = { createUser, fetchUser };




