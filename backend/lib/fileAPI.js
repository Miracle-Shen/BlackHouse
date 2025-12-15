const { Client, Databases,ID, Query  } = require( "appwrite");

require("dotenv").config({ path: "../.env" });
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT) // Replace <REGION> with your Appwrite region
    .setProject(process.env.APPWRITE_PROJECT_ID); // BlackHouse Project ID


const databases = new Databases(client);
const getPostsByUserId = async (userId) => {
    if (!userId) return;
    try {
      const posts = await databases.listDocuments(
        process.env.DATABASE_ID,
        "post",
        [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
      );
      if(!posts || Array.isArray(posts.documents) === false) return []; 
  
      return posts.documents; 
    } catch (error) {
      console.log(error);
    }
}

const recommandPostByTags = async (tags = [], limit = 4) => {
  if (!Array.isArray(tags) || tags.length === 0) return [];

  const searchPosts = async (tags) => {
    try {
      const result = await databases.listDocuments(
        process.env.DATABASE_ID,
        "post",
       [
        Query.contains("tags", tags)
      ]
      );

      return result?.documents || [];
    } catch (err) {
      console.error("searchPosts error:", err);
      return [];
    }
  };

  let allResults = [];

  const results = await Promise.all(tags.map((tag) => searchPosts(tag)));

  results.forEach((docs) => {
    allResults.push(...docs);
  });

  const uniqueMap = new Map();
  allResults.forEach((doc) => uniqueMap.set(doc.$id, doc));

  const uniquePosts = Array.from(uniqueMap.values());

  uniquePosts.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

  return uniquePosts.slice(0, limit);
};

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

// “先读再加 tag 再写回”的核心逻辑
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


const replaceTagsOnPost = async (postId, tagNames) => {
  if (!postId) throw new Error("replaceTagsOnPost: postId is required");
  if (!Array.isArray(tagNames)) throw new Error("replaceTagsOnPost: tagNames must be array");

  // 规范化：去空、去重、保序
  const uniq = Array.from(new Set(tagNames.map(s => String(s || "").trim()))).filter(Boolean);

  // 读一次
  const post = await getPostById(postId);
  const oldTags = Array.isArray(post.tags) ? post.tags : [];

  // 幂等：完全相同（集合相同）则不写
  const same =
    oldTags.length === uniq.length && oldTags.every(t => uniq.includes(t)) && uniq.every(t => oldTags.includes(t));
  if (same) return post;

  // 简易乐观锁：写前再确认一次 $updatedAt 没变（避免用户刚编辑、或重复任务交错写）
  const before = post.$updatedAt;
  const latest = await getPostById(postId);
  if (latest.$updatedAt !== before) {
    const e = new Error("CONFLICT: post changed before tagging write");
    e.code = "CONFLICT";
    e.meta = { postId, beforeUpdatedAt: before, latestUpdatedAt: latest.$updatedAt };
    throw e;
  }

  // replace 写入
  const updatedPost = await updatePostById(postId, { tags: uniq });
  return updatedPost;
};
const addUserInterest = async (userId,data) => {
  if (!data || !userId || typeof data !== "object") {
    throw new Error("updatePostById: updateData must be a non-empty object");
  }

  try {
    const old = await databases.listDocuments(
      process.env.DATABASE_ID,
      "user_tag",
      [Query.equal("userId", userId)]
    );
    for (const doc of old.documents) {
      await databases.deleteDocument(
        process.env.DATABASE_ID,
        "user_tag",
        doc.$id
      );
    }
    for (const item of data) {
      await databases.createDocument(
        process.env.DATABASE_ID,
        "user_tag",
        ID.unique(),
        {
          userId,
          interest: item.interest,                // 中文兴趣名
          relevanceScore: item.relevant_score,    // 0~1

        }
      );
    }

    return { userId, count: data.length };
  } catch (error) {
    throw error; // 一定要往上抛
  }
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

async function fetchInterestById(userId) {
  try {
    const info = await databases.listDocuments(
      process.env.DATABASE_ID,
      'user_tag',
      [Query.equal("userId", userId)] 
    );

    if (!info) throw Error;

    return info;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { getPostById, updatePostById, addTagToPost, getPostsByUserId,addUserInterest, fetchInterestById, recommandPostByTags,replaceTagsOnPost };