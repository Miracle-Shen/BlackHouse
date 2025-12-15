
// types/auth.ts
export type AuthState = {
  $id?: string;
  userId?: string;
  accessToken: string | null;
};
export type AuthStatus = "loading" | "authed" | "guest";
export type AuthContextType = {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
  status: AuthStatus;
  setStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
  persist: boolean;
  setPersist: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
};

export type GridPostListProps = {
  posts: Array<{
    $id: string;
    isPublished:boolean;
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
  $id: string;
  title: string;
  caption: string;
  imageId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  isPublished:boolean;
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
  isPublished:boolean;
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
export const makePostValidation = (opts: {
  action: "Create" | "Update";
  hasExistingImage: boolean;
}) =>
  z
    .object({
      caption: z
        .string()
        .min(5, { message: "最少5个字符." })
        .max(2200, { message: "最多2200个字符." }),
      file: z.custom<File[]>().optional(),
      tags: z.array(z.string()).optional(),
      title: z.string().min(1, { message: "标题不能为空" }),
      $id: z.string().optional(),
      isPublished: z.boolean().optional(),
    })
    .superRefine((val, ctx) => {
      const files = val.file ?? [];
      const hasNewFile = files.length > 0;

      if (opts.action === "Create") {
        if (!hasNewFile) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["file"],
            message: "请上传至少一张图片",
          });
        }
        return;
      }

      // Update：没有旧图 && 也没新图 => 报错
      if (!opts.hasExistingImage && !hasNewFile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["file"],
          message: "请上传至少一张图片",
        });
      }
    });