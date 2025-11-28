import { ID, Query } from "appwrite";

import { appwriteConfig, databases, storage, avatars } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser } from "@/types";
import { Title } from "@radix-ui/react-toast";

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
// export async function createUserAccount(user: INewUser) {
//   try {
//     const newAccount = await account.create(
//       ID.unique(),
//       user.password,
//       user.name
//     );

//     if (!newAccount) throw Error;

//     const avatarUrl = avatars.getInitials(user.name);

//     const newUser = await saveUserToDB({
//       accountId: newAccount.$id,
//       name: newAccount.name,
//       username: user.username,
//       avatarUrl: avatarUrl,
//     });

//     return newUser;
//   } catch (error) {
//     console.log(error);
//     return error;
//   }
// }

// ============================== SAVE USER TO DB
// export async function saveUserToDB(user: {
//   accountId: string;
//   email: string;
//   name: string;
//   avatarUrl: URL;
//   username?: string;
// }) {
//   try {
//     const newUser = await databases.createDocument(
//       appwriteConfig.databaseId,
//       appwriteConfig.userCollectionId,
//       ID.unique(),
//       user
//     );

//     return newUser;
//   } catch (error) {
//     console.log(error);
//   }
// }

// ============================== SIGN IN
// export async function signInAccount(user: { email: string; password: string }) {
//   try {
//     const session = await account.createEmailSession(user.email, user.password);

//     return session;
//   } catch (error) {
//     console.log(error);
//   }
// }

// ============================== GET ACCOUNT
// export async function getAccount() {
//   try {
//     const currentAccount = await account.get();

//     return currentAccount;
//   } catch (error) {
//     console.log(error);
//   }
// }

// ============================== GET USER
// export async function getCurrentUser() {
//   try {
//     const currentAccount = await getAccount();

//     if (!currentAccount) throw Error;

//     const currentUser = await databases.listDocuments(
//       appwriteConfig.databaseId,
//       appwriteConfig.userCollectionId,
//       [Query.equal("accountId", currentAccount.$id)]
//     );

//     if (!currentUser) throw Error;

//     return currentUser.documents[0];
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// }

// ============================== SIGN OUT
// export async function signOutAccount() {
//   try {
//     const session = await account.deleteSession("current");

//     return session;
//   } catch (error) {
//     console.log(error);
//   }
// }

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
    console.log("Creating post:", post);
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    // const fileUrl = getFilePreview(uploadedFile.$id);
    const fileUrl = uploadedFile.$id 
      ? `https://nyc.cloud.appwrite.io/v1/storage/buckets/69230b780026a1648b96/files/${uploadedFile.$id}/view?project=691ec46d0011cc0af217&mode=admin`
      : '';
    //https://nyc.cloud.appwrite.io/v1/storage/buckets/69230b780026a1648b96/files/69271c09000babf78ae1/view?project=691ec46d0011cc0af217&mode=admin
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        userId: post.userId,
        caption: post.caption,
        avatarUrl: fileUrl,
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
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      "top",
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

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
    console.log("from database  Fetched post:", post);
    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      avatarUrl: post.avatarUrl,
      imageId: post.imageId,
    };
    console
    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      console.log("上传新的image",uploadedFile);
      if (!uploadedFile) throw Error;

      // Get new file url
      // const fileUrl = getFilePreview(uploadedFile.$id);
      const fileUrl = uploadedFile.$id 
      ? `https://nyc.cloud.appwrite.io/v1/storage/buckets/69230b780026a1648b96/files/${uploadedFile.$id}/view?project=691ec46d0011cc0af217&mode=admin`
      : '';
      console.log("新的image url",fileUrl);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, avatarUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];
    console.log("tags",tags);
    //  Update post
     const payload: Record<string, any> = {
      userId: post.userId,
      avatarUrl: image.avatarUrl,
      imageId: image.imageId,
      title: post.title,
      caption: post.caption,
    };
    console.log("payload",payload);
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      payload
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}



// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("userId", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw Error;

    return posts;
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
  console.log("Updating user:", user);
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      avatarUrl: user.avatarUrl,
      avatarId: user.avatarId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const avatarUrl = uploadedFile.$id 
      ? `https://nyc.cloud.appwrite.io/v1/storage/buckets/69230b780026a1648b96/files/${uploadedFile.$id}/view?project=691ec46d0011cc0af217&mode=admin`
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
      user.id,
      {
        avatarUrl: image.avatarUrl,
        avatarId: image.avatarId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.avatarId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.avatarId && hasFileToUpdate) {
      await deleteFile(user.avatarId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}
