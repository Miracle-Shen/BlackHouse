export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  id: string;
  userId: string;
  userName: string;
  bio?: string;
  avatarId?: string;
  avatarUrl?: URL | string;
  file: File[];
};

export type INewPost = {
  id: string;
  userId: string;
  title: string;
  caption: string;
  imageId?: string;
  imageUrl?: URL;
  file: File[];
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  title: string;
  caption: string;
  imageId?: string;
  imageUrl?: URL;
  file: File[];
  tags?: string;
};

export type IUser = {
  id: string;
  name: string;
  username: string;
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
  userId: z.string(),
});
