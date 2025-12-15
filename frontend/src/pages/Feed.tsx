import React, { useMemo, useState,useCallback, forwardRef } from "react";
import { VirtuosoGrid } from "react-virtuoso";

import PostCard from "@/components/PostCard";
import PullToRefresh from "@/components/common/PullToRefresh";
import {useGetPostsLite} from "@/hooks/useGetPosts";
const GridList = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      style={style}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {children}
    </div>
  )
);
GridList.displayName = "GridList";

const SkeletonCard = () => (
  <div className="rounded-3xl bg-white p-3 ring-1 ring-slate-100">
    <div className="mb-3 w-full rounded-2xl bg-slate-200 animate-pulse aspect-[4/5]" />
    <div className="space-y-2">
      <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse" />
      <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
    </div>
  </div>
);

const FeedSkeletonOverlay = ({ show }: { show: boolean }) => (
  <div
    className={[
      "pointer-events-none absolute inset-0 transition-opacity duration-200",
      show ? "opacity-100" : "opacity-0",
    ].join(" ")}
    aria-hidden
  >
    <div className="mx-auto max-w-4xl px-3 pb-20 pt-0">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <li key={i}>
            <SkeletonCard />
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const FeedPage = () => {
  const {
    data: pages,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetPostsLite();
//console.log("postsData:", postsData);
/* const posts = useMemo(() => {
  // const all = postsData?.pages.flatMap((page: any) => page.documents) ?? [];
  const all = postsData?.pages.flatMap((page: any) => page?.data?.items ?? []) ?? [];
  return all.filter((p: any) => p?.isPublished !== false);
}, [postsData]); */
  const posts = useMemo(
  () => pages.flatMap(p => p.items),
  [pages]
);
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage){
      console.log("FeedPage: load more posts"); 
       fetchNextPage();
    } 
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const showSkeleton = isLoading && posts.length === 0;

  const gridData = useMemo(() => {
    if (posts.length === 0) return [];

    const needPad = !hasNextPage && posts.length % 2 === 1;
    return needPad ? [...posts, { __placeholder: true }] : posts;
  }, [posts, hasNextPage]);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  //console.log("scrollRef:", scrollRef.current?.clientHeight);
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  return (
    <div className="bg-white min-h-screen">
      <h1 className="text-center py-4 text-lg font-semibold text-slate-800">
        动态
      </h1>

      <div ref = {el=>{scrollRef.current = el;setScrollEl(el);}} className="h-[calc(100vh-56px)] overflow-auto overscroll-contain">
        <PullToRefresh onRefresh={refetch} scrollRef={scrollRef}>
          <div
            className="relative mx-auto max-w-4xl"
            style={showSkeleton ? { minHeight: "70vh" } : undefined}
          >
            <div className="px-3 pb-20 ">
              <VirtuosoGrid
                //useWindowScroll  //这意味这将滚动事件交给浏览器的原生的滚动系统。
                style={{ height: "100%" }} 
                customScrollParent={scrollEl ?? undefined}
                data={gridData}
                endReached={handleEndReached}
                overscan={10}
                computeItemKey={(_, post: any) =>
                  post?.$id ?? post?.id?? `${_}`
                }
                components={{
                  List: GridList,
                  Item: ({ children }) => <div>{children}</div>,
                  Footer: () => (
                    <div className="py-4 text-center text-xs text-slate-400 min-h-[32px]">
                      {hasNextPage
                        ? (isFetchingNextPage ? "加载中..." : "上拉加载更多")
                        : posts.length > 0
                          ? "没有更多了"
                          : ""}
                    </div>
                  ),
                }}
                itemContent={(_, post: any) => <PostCard post={post} />}
              />
            </div>

            <FeedSkeletonOverlay show={showSkeleton} />
          </div>
        </PullToRefresh>
      </div>
    </div>
  );
};

export default FeedPage;
