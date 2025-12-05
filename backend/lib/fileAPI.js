const { Client, Databases } = require( "appwrite");
const dotenv = require('dotenv');
dotenv.config();
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT) // Replace <REGION> with your Appwrite region
    .setProject(process.env.APPWRITE_PROJECT_ID); // BlackHouse Project ID


const databases = new Databases(client);

const getPostById = async (postId) => {
  if (!postId) {
    throw new Error("getPostById: postId is required");
  }

  try {
    const post = await databases.getDocument(
      process.env.DATABASE_ID,
      "post",
      postId
    );
    console.log("============================================Fetched post:\n", post);
    if (!post) {
      throw new Error(`getPostById: post not found, postId=${postId}`);
    }
    return post;
  } catch (error) {
    console.error("============================================[DB/getPostById] error:", {
      postId,
      error,
    });
    throw error;
  }
};

// ✅ “先读再加 tag 再写回”的核心逻辑
const addTagToPost = async (postId, tag) => {
  if (!postId) {
    throw new Error("addTagToPost: postId is required");
  }
  if (!tag) {
    throw new Error("addTagToPost: tag is required");
  }

  const post = await getPostById(postId);

  // 2. 把 tags 规范成数组（可能为空 / undefined）
  const oldTags = Array.isArray(post.tags) ? post.tags : [];

  // 3. 去重：已经有同样的 tag 就直接返回，不再写库
  if (oldTags.includes(tag)) {
    return post;
  }

  const newTags = [...oldTags, tag];

  const updatedPost = await updatePostById(postId, { tags: newTags });

  return updatedPost;
};


const updatePostById = async (postId, updateData) => {
  if (!postId) {
    throw new Error("updatePostById: postId is required");
  }
  if (!updateData || typeof updateData !== "object") {
    throw new Error("updatePostById: updateData must be a non-empty object");
  }

  try {
    const updatedPost = await databases.updateDocument(
      process.env.DATABASE_ID,
      "post",
      postId,
      {
        tags: updateData.tags,
      }
    );
    console.log("============================================Updated post:\n", updatedPost);
    return updatedPost;
  } catch (error) {
    console.error("============================================[DB/updatePostById] error:", {
      postId,
      updateData,
      error,
    });
    throw error; // 一定要往上抛
  }
};

module.exports = { getPostById, updatePostById, addTagToPost };
