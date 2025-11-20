import { useEffect, useState } from "react";
import axios from "../api/axios";
import PostCard from "./PostCard";
import type { PostData } from "./PostCard";
import { adaptPostData } from "../utils/dataAdapter";

export const FeedStream = () => {
  const [postAll, setPostAll] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController(); //如果组件卸载，取消请求
    
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("/details", {
          signal: controller.signal,
        });
        console.log("feed流首页", response.data);
        if (isMounted) {
          // 使用数据适配器转换后端数据格式
          const adaptedPosts = adaptPostData(response.data);
          setPostAll(adaptedPosts);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("获取数据失败，请稍后重试");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchDetails();
    return () => { //卸载时运行，清理
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleLike = (postId: string) => {
    // 处理点赞逻辑
    console.log('点赞帖子:', postId);
    // 这里可以调用点赞 API
  };

  const handleComment = (postId: string) => {
    // 处理评论逻辑
    console.log('评论帖子:', postId);
    // 导航到评论页面
  };

  const handleShare = (postId: string) => {
    // 处理分享逻辑
    console.log('分享帖子:', postId);
    // 调用分享功能
  };

  const handleMore = (postId: string) => {
    // 处理更多操作
    console.log('更多操作:', postId);
    // 显示操作菜单
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span className="ml-2 text-gray-500">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-center text-gray-800">动态</h1>
      </div>
      
      {postAll?.length ? (
        <div>
          {postAll.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onMore={handleMore}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">暂无内容</p>
          <p className="text-sm text-gray-400">刷新试试看</p>
        </div>
      )}
    </div>
  );
}   