import PostCard from "@/components/PostCard";
import { useGetRecentPosts } from "@/lib/react-query/queries";
import PullToRefresh from "@/components/common/PullToRefresh";

const FeedPage = () => {
  const {
    data: posts = [],
    isPending: isLoading,
    refetch,
  } = useGetRecentPosts();

  // skeleton 数据
  const skeletonPosts = Array.from({ length: 6 }).map((_, i) => ({
    $id: `skeleton-${i}`,
    title: "",
    thumbnailUrl: "",
    creator: undefined,
    $createdAt: "",
  }));

  const displayedPosts = isLoading ? skeletonPosts : posts;

  return (
    <div className="bg-white min-h-screen">
      {/* 顶部标题 */}
      <h1 className="text-center py-4 text-lg font-semibold text-slate-800">
        动态
      </h1>

      <PullToRefresh onRefresh={refetch}>
        <div className="mx-auto max-w-4xl px-3 pb-20">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {displayedPosts.map((post) => (
              <li key={post.$id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        </div>
      </PullToRefresh>
    </div>
  );
};

export default FeedPage;
