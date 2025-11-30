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
  file?: File[];
  tags?: string;
  $createdAt?: string;
};

export type IUpdatePost = {
  creator?: string| IUser;
  $id: string;
  title: string;
  caption: string;
  imageId?: string;
  imageUrl?: string;
  file: File[];
  tags?: string;
};

export type IUser = {
  $id: string;
  userId:string;
  avatarId:string;
  userName: string;
  avatarUrl?: string;
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
  caption: z.string().min(5, { message: "Minimum 5 characters." }).max(2200, { message: "Maximum 2,200 caracters" }),
  file: z.custom<File[]>(),
  tags: z.string() .optional(),
  title: z.string(),
  $id: z.string(),
});
