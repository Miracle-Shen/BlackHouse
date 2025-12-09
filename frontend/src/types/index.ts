
// types/auth.ts
export type AuthData = {
  $id: string;
  userId: string;
  accessToken: string;   // 如果你现在就想这么用，先保留
};

export type AuthContextType = {
  auth: AuthData | null;
  setAuth: React.Dispatch<React.SetStateAction<AuthData | null>>;
};

export type GridPostListProps = {
  posts: Array<{
    $id: string;
    title?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
  }>;
  showUser?: boolean;
  showStats?: boolean;
};

// ============================================================
//RESPONSE TYPES
// ============================================================
export type IRegisterResponse = {
  status: string;
  message?: string;
};

export type ILoginResponse = {
  $id: string;
  userId: string;
  accessToken: string;
};
// ============================================================
// export type PostCardProps = {
//   post: {
//     creator?: {
//       id: string;
//       userId: string;
//       userName: string;
//       avatarId?: string;
//       avatarUrl?: URL | string;
//     };
//     title?: string;
//     imageUrl?: string;
//     $createdAt: string;
//     $id: string;
//   };
// };

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  $id: string;
  userId: string;
  userName: string;
  avatarId?: string;
  avatarUrl?:string;
  file: File[];
};

export type INewPost = {
  creator?:string| IUser;
  $id?: string;
  title?: string;
  caption?: string;
  imageId?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  file?: File[];
  tags?: string[];
  $createdAt?: string;
};

export type IUpdatePost = {
  creator?: string| IUser;
  $id: string;
  title?: string;
  caption?: string;
  imageId?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  file: File[];
  tags?: string[];
};

export type IUser = {
  $id: string;
  userId:string;
  avatarId:string;
  userName: string;
  avatarUrl?: string;
  thumbnailUrl?: string;
  thumbnailId?:string;
};

export type INewUser = {
  userName: string;
  password: string;
};


import * as z from "zod";

// ============================================================
// USER
// ============================================================
export const SignupValidation = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Name must be at least 2 characters." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const SigninValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const ProfileValidation = z.object({
  file: z.custom<File[]>(),
});

// ============================================================
// POST
// ============================================================
export const PostValidation = z.object({
  caption: z.string().min(5, { message: "最少5个字符." }).max(2200, { message: "最多2200个字符." }),
  file: z.custom<File[]>().refine((files) => files && files.length > 0, { message: "请上传至少一张图片" }),
  tags: z.array(z.string()).optional(),
  title: z.string().min(1, { message: "标题不能为空" }),
  $id: z.string().optional(),
});

export const UpdatePostValidation = PostValidation.refine(
  (data) => {
    // 已有图片ID且未上传新文件时通过验证
    if (data.$id && !data.file.length) return true;
    // 新上传了文件时通过验证
    return data.file.length > 0;
  },
  { message: "请上传至少一张图片", path: ["file"] }
);