import { multiFormatDateString } from "@/lib/utils";
import { Link } from "react-router-dom";
import type {INewPost,IUser} from '@/types'

const PostCard = ({post}: {post: INewPost}) => {
  const creator = post.creator as IUser | undefined;
  const avatarUrl = creator?.avatarUrl || "./icons/profile-placeholder.svg";
  const userName = creator?.userName || "加载中...";
    return (
    <div className="rounded-3xl border p-3 lg:p-5 w-full max-w-screen-sm">
      <Link className="bg-primary-50" to={`/posts/${post.$id}`}>
        <div className="small-medium lg:base-medium py-2 px-3 truncate w-4/5">
           <p>{post.title || "标题加载中..."}</p>
         {/*  <p className="text-light-2">{post.caption}</p> */}
{/*           {post?.tags ? (<ul className="flex gap-1 mt-2">
            {post.tags.map((tag: string, index: string) => (
              <li key={`${tag}${index}`} className="text-light-3 small-regular">
                #{tag}
              </li>
            ))}
          </ul>) : null} */}
        </div>
        <div className="w-full h-32 lg:h-64">
        <img
          src={post?.imageUrl || "./icons/posts.svg"}
          alt="post image"
          className=" h-full w-full object-cover rounded-[24px] mb-5 border border-gray-200"
        />
        </div>
      </Link>

    <div className="flex flex-col  mt-4">
        <div className="flex items-center gap-2">
          <img
            src={avatarUrl}
            alt="creator"
            className="w-4 h-4 lg:w-8 lg:h-8 rounded-full"
          />
          <p className="base-medium lg:body-bold text-light-1">
            {userName}
          </p>
        </div>

        <div className="text-light-3 text-xs flex items-center gap-1">
          <img src="./icons/wallpaper.svg" alt="calendar icon"  className="w-3 h-3 lg:w-6 lg:h-6 rounded-full"/>
          <p className="subtle-semibold lg:small-regular ">
            {post.$createdAt ? multiFormatDateString(post.$createdAt) : "日期加载中..."}
          </p>
        </div>
      </div>

      {/* <PostStats post={post} userId={user.id} /> */}
    </div>
  );
}

export default PostCard;