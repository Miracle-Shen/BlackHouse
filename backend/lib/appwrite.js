import { Client, ID, TablesDB } from "appwrite";

// const client = new Client()
//     .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
//     .setProject('<PROJECT_ID>');

// const tablesDB = new TablesDB(client);

// const promise = tablesDB.createRow({
//     databaseId: '<DATABASE_ID>',
//     tableId: '<TABLE_ID>',
//     rowId: ID.unique(),
//     data: { title: "Hamlet" }
// });

// promise.then(function (response) {
//     console.log(response);
// }, function (error) {
//     console.log(error);
// });

//post 
export const createPost = async (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    const img_url = req.body.img_url;
    const author = req.body.author;
    const create_time = req.body.create_time;
    const is_published = req.body.is_published;
    try{
        const post = await database.createDocument(
            'Post', // collection ID
            {
                title: title,
                content: content,
                img_url: img_url,
                author: author,
                create_time: create_time,
                is_published: is_published
            }
        );
    }catch(error){
        console.log("Error creating post:", error);
        res.status(500).json({ message: "Error creating post" });
    }
}

export const getPosts = async (req, res) => {
    try{
        const posts = await database.getDocument('Post');
        res.status(200).json(posts);
    }catch(error){
        console.log("Error fetching posts:", error);
        res.status(500).json({ message: "Error fetching posts" });
    }
}

//user
export const getUsers = async (req, res) => {
    try{
        const users = await database.getDocument('Users');
        res.status(200).json(users);
    }catch(error){
        console.log("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users" });
    }
}     


//
export const createUser = async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    try{
        const user = await database.createDocument('User', {
            name: name,
            email: email,
            password: password
        });
    }catch(error){
        console.log("Error creating user:", error);
        res.status(500).json({ message: "Error creating user" });
    }
}