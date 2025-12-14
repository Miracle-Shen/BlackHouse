import { ID, Query } from "appwrite";
import { appwriteConfig, databases, storage } from "./config";
import type { IUpdatePost, INewPost, IUpdateUser } from "@/types";
import axios from "@/api/axios";

// ============================================================
// POSTS
// ============================================================
// ============================== GET FILE URL
export async function createThumbnailFile(
  file: File,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.7
): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error("无法读取图片数据"));
        return;
      }

      img.onload = () => {
        let { width, height } = img;

        const ratio = Math.min(
          maxWidth / width,
          maxHeight / height,
          1
        );

        const targetWidth = width * ratio;
        const targetHeight = height * ratio;

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 2D context 不可用"));
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // 导出 WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("生成 WebP 缩略图失败"));
              return;
            }

            const thumbFile = new File(
              [blob],
              `thumb_${file.name.replace(/\.[^.]+$/, "")}.webp`,
              {
                type: "image/webp",
                lastModified: Date.now(),
              }
            );

            resolve(thumbFile);
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => reject(new Error("图片加载失败"));
      img.src = e.target.result as string;
    };

    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.readAsDataURL(file);
  });
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

export async function getInfinitePosts({
  pageParam,
  }: {
    pageParam?: string | null;
  }) {
  // 1. 组装 Appwrite 查询条件
  const queries: string[] = [
    Query.orderDesc("$updatedAt"),
    Query.limit(8),
    Query.equal("isPublished", true),
  ];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam));
  }

  try {
    const postList = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    const posts = postList.documents ?? [];

    const postsWithUserDetails: INewPost[] = await Promise.all(
      posts.map(async (post: any) => {
        try {
          const user = await getUserById(post.creator);

          return {
            $id: post.$id,
            creator: user || post.creator,
            thumbnailUrl: post.thumbnailUrl,
            title: post.title,
            caption: post.caption,
            imageUrl: post.imageUrl,
            imageId: post.imageId,
            file: [], // 适配 INewPost
            tags: post.tags,
            $createdAt: post.$createdAt,
            isPublished: post.isPublished ?? false,
          } as INewPost;
        } catch (error) {
          // 拉用户失败就退回原始 creator
          return {
            $id: post.$id,
            creator: post.creator,
            thumbnailUrl: post.thumbnailUrl,
            title: post.title,
            caption: post.caption,
            imageUrl: post.imageUrl,
            imageId: post.imageId,
            file: [],
            tags: post.tags,
            $createdAt: post.$createdAt,
            isPublished: post.isPublished ?? false,
          } as INewPost;
        }
      })
    );

  
    return {
      ...postList,
      documents: postsWithUserDetails,
    };
  } catch (error) {
    console.error("getInfinitePosts error:", error);
    throw error;
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

// ============================== CREATE POST
function normalizeTags(input: string | string[] | undefined | null): string[] {
  if (!input) return [];

  // 情况 1：数组，直接清洗
  if (Array.isArray(input)) {
    return input.map(t => t.trim()).filter(Boolean);
  }

  // 情况 2：字符串，可能包含多个逗号（中英文）、空格
  return input
    .split(/,|，/)            // 用正则匹配 英文逗号 或 中文逗号
    .map(t => t.trim())       // 去掉空格
    .filter(Boolean);         // 过滤空值
}

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
    const thumbFile = await createThumbnailFile(post?.file ? post.file[0] : new File([], ""), 400, 400, 0.7);
    const uploadedThumb = await uploadFile(thumbFile);
     if (!uploadedThumb) throw Error;
    const thumbnailUrl = uploadedThumb.$id
      ? `https://nyc.cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.storageId}/files/${uploadedThumb.$id}/view?project=${appwriteConfig.projectId}&mode=admin`
      : '';
    // Convert tags into array
    const tags = normalizeTags(post.tags);


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
        thumbnailUrl: thumbnailUrl,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    void axios.post("/genTag", {
        message: `this is the postID:${newPost.$id}`,
      })
      .catch((err) => {
        console.error("[createPost] start genTag failed", err);
      });
    return newPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post?.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
      thumbnailUrl: post.thumbnailUrl,
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
      const thumbFile = await createThumbnailFile(post?.file ? post.file[0] : new File([], ""), 400, 400, 0.7);
      const uploadedThumb = await uploadFile(thumbFile);
      if (!uploadedThumb) throw Error;
      const thumbnailUrl = uploadedThumb.$id
        ? `https://nyc.cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.storageId}/files/${uploadedThumb.$id}/view?project=${appwriteConfig.projectId}&mode=admin`
        : '';
      image = { ...image,thumbnailUrl: thumbnailUrl, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into arrays
    const tags = normalizeTags(post.tags);

    // Update post
   const creatorId = typeof post.creator === "object" && post.creator !== null ? post.creator.$id : post.creator;
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.$id,
      {
        creator: creatorId,
        imageUrl: image.imageUrl,
        thumbnailUrl: image.thumbnailUrl,
        imageId: image.imageId,
        title: post.title,
        caption: post.caption,
        tags: tags,
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
     void axios.post("/genTag", {
        message: `this is the postID:${updatedPost.$id}`,
      })
      .catch((err) => {
        console.error("[createPost] start genTag failed", err);
      });
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
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// 导入 INewPost 类型
export async function getRecentPosts(): Promise<INewPost[]> {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw new Error("No posts found"); // 明确抛出错误

    // 处理 posts 并转换为 INewPost 结构
    const postsWithUserDetails = await Promise.all(
      posts.documents.map(async (post) => {
        try {
          const user = await getUserById(post.creator);
          // 确保每个 post 都符合 INewPost 结构
          return {
            $id: post.$id,
            creator: user || post.creator,
            thumbnailUrl: post.thumbnailUrl,
            title: post.title,
            caption: post.caption,
            imageUrl: post.imageUrl,
            imageId: post.imageId,
            file: [], // 适配 INewPost 的 file 字段
            tags: post.tags,
            $createdAt: post.$createdAt,
            isPublished: post.isPublished ?? false,
          } as INewPost;
        } catch (error) {
          return {
            $id: post.$id,
            creator: post.creator,
            thumbnailUrl: post.thumbnailUrl,
            title: post.title,
            caption: post.caption,
            imageUrl: post.imageUrl,
            imageId: post.imageId,
            file: [],
            tags: post.tags,
            $createdAt: post.$createdAt,
            isPublished: post.isPublished ?? false,
          } as INewPost;
        }
      })
    );

    return postsWithUserDetails; 
  } catch (error) {
    console.log(error);
    return []; 
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

    const webpAvatarFile =await createThumbnailFile(user.file[0], 400, 400, 0.7);
    const webpAvatarUrl = await uploadFile(webpAvatarFile);
     if (!webpAvatarUrl) throw Error;
    const thumbnailUrl = webpAvatarUrl.$id
      ? `https://nyc.cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.storageId}/files/${webpAvatarUrl.$id}/view?project=${appwriteConfig.projectId}&mode=admin`
      : '';
    //  Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.$id,
      {
        avatarUrl: image.avatarUrl,
        avatarId: image.avatarId,
        thumbnailUrl:thumbnailUrl,
        thumbnailId: webpAvatarUrl.$id,
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
