const { Client, ID, Storage, Models } = require( "appwrite");
const dotenv = require('dotenv');
dotenv.config();
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT) // Replace <REGION> with your Appwrite region
    .setProject(process.env.APPWRITE_PROJECT_ID);

const storage = new Storage(client);


exports.uploadFile = async (file,res) => {
    console.log("Uploading file:", typeof(file));
    try {
        const appwriteFile = new File(
            [file.buffer],          // 文件内容（ArrayBuffer 或 Buffer）
            file.originalname,      // 文件名
            { type: file.mimetype } // 文件类型
        );
        
        console.log("是否为 File 实例:", appwriteFile instanceof File); // true
        
        // 使用对象参数形式上传
        const response = await storage.createFile({
            bucketId: process.env.STORAGE_BUCKET_ID,
            fileId: ID.unique(),
            file: appwriteFile,
            contentType: file.mimetype
        });

        res.status(200).json(response);
    } catch (error) {
        console.log("Error uploading file:", error);
        res.status(500).json({ message: "Error uploading file" });
    }   
}

const getPostById = async (postId) => {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      process.env.DATABASE_ID,
      'post',
      postId
    );
    console.log("Fetched post:", post);
    if (!post) throw Error;
  } catch (error) {
    console.log(error);
  }
  return post
}

const updatePostById = async (postId, updateData) => {
  if (!postId || !updateData) throw Error;
    try {
      const updatedPost = await databases.updateDocument(
        process.env.DATABASE_ID,
        'post',
        postId,
        updateData
      );
      console.log("Updated post:", updatedPost);
      return updatedPost;
    } catch (error) {
      console.log(error);
    }

}

module.exports = {
  getPostById,
  updatePostById
}