import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import {
  getUsers,
  createPost,
  getPostById,
  updatePost,
  getUserPosts,
  getUserById,
  updateUser,
  getRecentPosts,
  //getInfinitePosts,
  //searchPosts,
  deletePost,
} from "@/lib/appwrite/api";
import type{ INewPost, IUpdatePost, IUpdateUser } from "@/types";
import axios from "@/api/axios";

// ============================================================
// POST QUERIES
// ============================================================
const fetchFeed = async ({ pageParam = undefined }) => {
  const res = await axios.get("/feed", {
    params: {
      limit: 8,
      ...(pageParam ? { cursor: pageParam } : {}),
    },
  });

  return res.data;
};

export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    // queryFn: getInfinitePosts as any,
    queryFn: fetchFeed,
    initialPageParam: undefined, 
    getNextPageParam: (lastPage: any) =>
      lastPage?.data?.nextCursor ?? undefined,

    //  减少首屏抖动 & 重复请求
    staleTime: 30_000,            // 30s 内认为数据新鲜
    gcTime: 5 * 60_000,           // 5min 缓存（TanStack Query v5）
    refetchOnWindowFocus: false,  // 切回页面不闪
    refetchOnReconnect: true,     // 断网恢复可刷新（可按需求改）

    //  网络抖动友好：只重试少量次，并跳过 4xx
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status && status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
  });
};


export const useGetRecentPosts = () => {
  return useQuery<INewPost[]>({ // 修正返回类型为 INewPost[]
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  });
};
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useGetPostById = (postId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useGetUserPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};



// ============================================================
// USER QUERIES
// ============================================================

// export const useGetCurrentUser = () => {
//   return useQuery({
//     queryKey: [QUERY_KEYS.GET_CURRENT_USER],
//     queryFn: getCurrentUser,
//   });
// };

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getUsers(limit),
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
      });
    },
  });
};
