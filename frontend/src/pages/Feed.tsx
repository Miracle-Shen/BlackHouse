import PostCard from '@/components/PostCard';
import {  useGetRecentPosts } from '@/lib/react-query/queries';
import { useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
const FeedPage = () => {
  const { data: posts = [], isPending: isLoading } = useGetRecentPosts();
  const { auth } = useAuth();

  useEffect(() => {
    if(!auth){
      const userInfo = localStorage.getItem('user');
      // updatePost(userInfo)
      console.log('FeedPage userInfo from localStorage:', userInfo);
    }
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <h1 className="text-center py-4">动态</h1>
      {isLoading ? (
        <p className="text-center">加载中...</p>
      ) : (
        <div className="max-w-md mx-auto">
          {posts.length > 0 ? (
            <ul className='flex flex-col'>
              {posts.map((post) => (
                <li
                  key={`post-${post.id}`}
                  className="border-b border-gray-200 p-4 bg-white mb-2"
                >
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">
              暂无动态，快去发布第一条吧～
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedPage;