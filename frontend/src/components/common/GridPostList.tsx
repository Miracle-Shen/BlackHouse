import { useNavigate } from "react-router-dom";
import type { GridPostListProps } from "@/types";

const GridPostList = ({ posts }: GridPostListProps) => {
const navigate = useNavigate();

  // 草稿：去编辑页
  const goToEdit = (postId: string) => {
    navigate(`/edit/${postId}`);
  };

  //  已发布：去详情页
  const goToDetail = (postId: string) => {
    navigate(`/posts/${postId}`);
  };

  return (
    <div className="bg-dark-2 rounded-3xl border border-dark-4 p-5 lg:p-7 w-full max-w-screen-sm">
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {posts.map((post) => {
            const imgUrl =
              post.thumbnailUrl || post.imageUrl || "/icons/default-image.svg";

           const isDraft = post.isPublished === false;

            return (
              <div
                key={post.$id}
                onClick={()=>
                  isDraft
                    ? goToEdit(post.$id)
                    : goToDetail(post.$id)
                }
                className="group block rounded-3xl bg-white/90 p-3 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
              >
                <div className="relative mb-3 overflow-hidden rounded-2xl bg-slate-100">
                  {/* —— 状态 Badge —— */}
                  <span
                    className={[
                      "absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur",
                      isDraft
                        ? "bg-amber-500/80 text-white"
                        : "bg-emerald-500/80 text-white",
                    ].join(" ")}
                  >
                    {isDraft ? "草稿" : "已发布"}
                  </span>

                  <img
                    src={imgUrl}
                    alt={post.title || "post image"}
                    className="h-36 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-44"
                  />
                </div>

                <h2 className="line-clamp-1 text-sm font-semibold text-slate-900 sm:text-base">
                  {post.title || "Untitled"}
                </h2>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          暂无内容，快去发布第一条吧～
        </div>
      )}
    </div>
  );
};

export default GridPostList;
