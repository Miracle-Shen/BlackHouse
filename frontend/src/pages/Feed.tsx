import PostCard from "@/components/PostCard";
import { useGetPosts } from "@/lib/react-query/queries";
import PullToRefresh from "@/components/common/PullToRefresh";
import { useEffect, useRef } from "react";
const FeedPage = () => {
  const {
  data: postsData,
  isLoading,
  refetch,             // 下拉刷新用
  fetchNextPage,       // 加载更多
  hasNextPage,         // 是否还有下一页
  isFetchingNextPage,  // 正在加载更多
} = useGetPosts();

  // skeleton 数据
  const skeletonPosts = Array.from({ length: 6 }).map((_, i) => ({
    $id: `skeleton-${i}`,
    title: "",
    thumbnailUrl: "",
    creator: undefined,
    $createdAt: "",
  }));
   const posts =
    postsData?.pages.flatMap((page: any) => page.documents) ?? [];
  const displayedPosts = isLoading ? skeletonPosts : posts;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    if (!hasNextPage) return;

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (
        first.isIntersecting && // 进入可视区域
        hasNextPage &&          // 还有下一页
        !isFetchingNextPage     // 没在加载中
      ) {
        fetchNextPage();
      }
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="bg-white min-h-screen">
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

          {/* 底部加载器 */}
          <div
            ref={loadMoreRef}
            className="py-4 text-center text-xs text-slate-400"
          >
            {isFetchingNextPage
              ? "加载中..."
              : hasNextPage
              ? "上拉加载更多..."
              : posts.length > 0
              ? "没有更多了"
              : ""}
          </div>

        </div>
      </PullToRefresh>
    </div>
  );
};

export default FeedPage;
