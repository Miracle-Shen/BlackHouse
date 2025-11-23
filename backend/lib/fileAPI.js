const { Client, ID, Storage } = require( "appwrite");
const dotenv = require('dotenv');
dotenv.config();
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT) // Replace <REGION> with your Appwrite region
    .setProject(process.env.APPWRITE_PROJECT_ID);

const storage = new Storage(client);


exports.uploadFile = async (file) => {
    console.log("Uploading file:", file);
    try {
        const response = await storage.createFile({
            bucketId: process.env.STORAGE_BUCKET_ID,
            fileId: ID.unique(),    
            file: file.buffer, // Use the file buffer
            contentType: file.mimetype // Set the content type
        });
        res.status(200).json(response);
    } catch (error) {
        console.log("Error uploading file:", error);
        res.status(500).json({ message: "Error uploading file" });
    }   
}

exports.fetchFile = async (req, res) => {
    const fileId = req.params.fileId;
    try{
        const file = await storage.getFileDownload({
            bucketId: process.env.STORAGE_BUCKET_ID,
            fileId: fileId
        });
        res.status(200).json(file);
    } catch(error){
        console.log("Error fetching file:", error);
        res.status(500).json({ message: "Error fetching file" });
    }
}