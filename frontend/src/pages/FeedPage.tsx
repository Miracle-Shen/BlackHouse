import PostCard from '@/components/PostCard';
import {  useGetRecentPosts } from '@/lib/react-query/queries';



const FeedPage = () => {
  const {data: posts,isPending: isLoading,isError}=useGetRecentPosts();
  console.log("posts", posts);
  return (
    <div className="bg-gray-50 min-h-screen">
      <h1 className="text-center py-4">动态</h1>
      {isLoading && !posts ? (
        <>
          <p>加载中...</p>
        </>
      ) : (
        <ul className='flex flex-col max-w-md mx-auto'>
          {posts?.map((post)=>{
            return (
              <li key={post.id} className="border-b border-gray-200 p-4 bg-white mb-2">
                <PostCard post={post} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default FeedPage