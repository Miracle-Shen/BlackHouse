import { multiFormatDateString } from "@/lib/utils";
import { Link } from "react-router-dom";
import type {INewPost,IUser} from '@/types'

const PostCard = ({post}: {post: INewPost}) => {
  console.log('PostCard post data:', post);
  const creator = post.creator as IUser | undefined;
  const avatarUrl = creator?.avatarUrl || "./icons/profile-placeholder.svg";
  const userName = creator?.userName || "加载中...";
    return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
            <img
              src={avatarUrl}
              alt="creator"
              className="w-9 h-9 lg:w-12 lg:h-12 rounded-full"
            />

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {userName}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular ">
               {post.$createdAt ? multiFormatDateString(post.$createdAt) : "日期加载中..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Link to={`/posts/${post.$id}`}>
        <div className="small-medium lg:base-medium py-5">
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
          className="post-card_img"
        />
        </div>
      </Link>

      {/* <PostStats post={post} userId={user.id} /> */}
    </div>
  );
}

export default PostCard;