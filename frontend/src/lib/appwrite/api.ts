import { ID, Query } from "appwrite";
import { appwriteConfig, databases, storage } from "./config";
import type { IUpdatePost, INewPost, IUpdateUser } from "@/types";
import type { Models } from "appwrite";

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post?.file ? post.file[0] : new File([], ""));

    if (!uploadedFile) throw Error;

    // Get file url
    // const fileUrl = getFilePreview(uploadedFile.$id);
    const fileUrl = uploadedFile.$id 
      ? `https://nyc.cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.storageId}/files/${uploadedFile.$id}/view?project=${appwriteConfig.projectId}&mode=admin`
      : '';
   if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convert tags into array
    //const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.creator,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        title: post.title,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET FILE URL
// export function getFilePreview(fileId: string) {
//   try {
//     const fileUrl = storage.getFilePreview(
//       appwriteConfig.storageId,
//       fileId,
//       2000,
//       2000,
//       "top",
//       100
//     );

//     if (!fileUrl) throw Error;

//     return fileUrl;
//   } catch (error) {
//     console.log(error);
//   }
// }

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    try {
      const user = await getUserById(post.creator);
      return { ...post, creator: user };
    } catch (error) {
      console.log(`Failed to fetch user for post ${post.$id}:`, error);
      return post; // Return the post as is if user fetch fails
    }
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };
    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      const fileUrl =uploadedFile.$id 
      ? `https://nyc.cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.storageId}/files/${uploadedFile.$id}/view?project=${appwriteConfig.projectId}&mode=admin`
      : '';
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into arrays
    const tags = post.tags?.replace(/ /g, "").split(",") || [];
    console.log("tags",tags);
    // Update post
   const creatorId = typeof post.creator === "object" && post.creator !== null ? post.creator.$id : post.creator;
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.$id,
      {
        creator: creatorId,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        title: post.title,
        caption: post.caption,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate && image.imageId) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST
// export async function deletePost(postId?: string, imageId?: string) {
//   if (!postId || !imageId) return;

//   try {
//     const statusCode = await databases.deleteDocument(
//       appwriteConfig.databaseId,
//       appwriteConfig.postCollectionId,
//       postId
//     );

//     if (!statusCode) throw Error;

//     await deleteFile(imageId);

//     return { status: "Ok" };
//   } catch (error) {
//     console.log(error);
//   }
// }



// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;
  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
type PostWithCreator = Models.Document & {
  creator: INewPost | undefined; // creator 可能是用户文档或 undefined
};

// 显式指定返回类型为 Promise<PostWithCreator[] | undefined>
// export async function getRecentPosts(): Promise<PostWithCreator[] | undefined> {
//   try {
//     const posts = await databases.listDocuments(
//       appwriteConfig.databaseId,
//       appwriteConfig.postCollectionId,
//       [Query.orderDesc("$createdAt"), Query.limit(20)]
//     );

//     if (!posts) throw Error;

//     const postsWithUserDetails = await Promise.all(
//       posts.documents.map(async (post) => {
//         try {
//           const user = await getUserById(post.creator);
//           return { ...post, creator: user } as PostWithCreator; // 断言为定义的类型
//         } catch (error) {
//           return { ...post, creator: undefined } as PostWithCreator; // 处理用户获取失败的情况
//         }
//       })
//     );

//     return postsWithUserDetails;
//   } catch (error) {
//     console.log(error);
//     return undefined; // 显式返回 undefined，符合返回类型定义
//   }
// }
// 修改 getRecentPosts 函数的返回处理
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );
    if (!posts) throw Error;

    const postsWithUserDetails = await Promise.all(
      posts.documents.map(async (post) => {
        try {
          const user = await getUserById(post.creator);
          // 明确转换为 INewPost 结构，确保 creator 是用户信息对象（而非 INewPost）
          return {
            id: post.$id, // 映射文档 ID 到 INewPost 的 id
            userId: post.userId,
            creator: user || post.creator, // 确保 creator 是用户对象或字符串
            title: post.title,
            caption: post.caption,
            imageUrl: post.imageUrl,
            imageId: post.imageId,
            file: [], // 非必要时可设为空数组（根据实际需求调整）
            tags: post.tags,
            $createdAt: post.$createdAt
          } as INewPost; // 显式断言为 INewPost 类型
        } catch (error) {
          // 错误处理时也保持类型一致
          return {
            ...post,
            id: post.$id,
            creator: post.creator,
            file: []
          } as INewPost;
        }
      })
    );

    return postsWithUserDetails;
  } catch (error) {
    console.log(error);
  }
}
// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  if(!userId) throw Error;
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      avatarUrl: user.avatarUrl,
      avatarId: user.avatarId,
    };

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const avatarUrl = uploadedFile.$id 
      ? `https://nyc.cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.storageId}/files/${uploadedFile.$id}/view?project=${appwriteConfig.projectId}&mode=admin`
      : '';
      if (!avatarUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, avatarUrl: avatarUrl, avatarId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.$id,
      {
        avatarUrl: image.avatarUrl,
        avatarId: image.avatarId,
      }
    );

    // Safely delete old file after successful update
    if (user.avatarId && hasFileToUpdate) {
      await deleteFile(user.avatarId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}
