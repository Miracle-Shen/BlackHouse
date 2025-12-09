import { multiFormatDateString } from "@/lib/utils";
import { Link } from "react-router-dom";
import type { INewPost, IUser } from "@/types";

const PostCard = ({ post }: { post: INewPost }) => {
  const creator = post.creator as IUser | undefined;
  const avatarUrl = creator?.thumbnailUrl ||creator?.avatarUrl || "./icons/profile-placeholder.svg";
  const userName = creator?.userName || "加载中...";
  const imgUrl = post.thumbnailUrl || post.imageUrl;
  return (
    <article className="w-full max-w-screen-sm">
      <Link
        to={`/posts/${post.$id}`}
        className="group block rounded-3xl bg-white/90 p-3 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md sm:p-4"
      >
        {/* 图片 */}
        <div className="relative mb-3 overflow-hidden rounded-2xl bg-slate-100">
          <img
            src={imgUrl || "./icons/posts.svg"}
            alt={post.title || "post image"}
            className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-52"
          />
        </div>

        {/* 文本内容 */}
        <div className="space-y-2">
          {/* 标题 */}
          <h2 className="line-clamp-2 text-sm font-semibold text-slate-900 sm:text-base">
            {post.title || "标题加载中..."}
          </h2>

          {/* 简短摘要（可选，如果你以后想开） */}
          {/* {post.caption && (
            <p className="line-clamp-2 text-xs text-slate-500 sm:text-sm">
              {post.caption}
            </p>
          )} */}

          {/* 作者 & 时间 */}
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img
                src={avatarUrl}
                alt="creator"
                className="h-7 w-7 rounded-full object-cover sm:h-8 sm:w-8"
              />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-800 sm:text-sm">
                  {userName}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <img
                    src="./icons/wallpaper.svg"
                    alt="calendar icon"
                    className="h-3 w-3"
                  />
                  {post.$createdAt
                    ? multiFormatDateString(post.$createdAt)
                    : "日期加载中..."}
                </span>
              </div>
            </div>
          </div>

          {/* 标签（如果你之后想启用） */}
          {/* {post?.tags && post.tags.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {post.tags.map((tag: string, index: number) => (
                <li
                  key={`${tag}-${index}`}
                  className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500"
                >
                  #{tag}
                </li>
              ))}
            </ul>
          )} */}
        </div>
      </Link>
    </article>
  );
};

export default PostCard;
