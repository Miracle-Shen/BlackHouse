import PostCard from '@/components/PostCard';
import {  useGetRecentPosts } from '@/lib/react-query/queries';

const FeedPage = () => {
  const { data: posts = [], isPending: isLoading } = useGetRecentPosts();

  const skeletonPosts = Array.from({ length: 3 }).map((_, i) => ({
    $id: `skeleton-${i}`,
    title: "",
    imageUrl: "",
    creator: undefined,
    $createdAt: "",
  }));

  const displayedPosts = isLoading ? skeletonPosts : posts;

  return (
    <div className="bg-gray-50 min-h-screen">
      <h1 className="text-center py-4">动态</h1>

      <div className="max-w-md mx-auto">
        <ul className="flex flex-col">
          {displayedPosts.map((post) => (
            <li key={post.$id} className="border-b border-gray-200 p-4 bg-white mb-2">
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FeedPage;