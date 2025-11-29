import { multiFormatDateString } from "@/lib/utils";
import type { Models } from "node_modules/appwrite/types/client";
import { Link } from "react-router-dom";

type PostCardProps = {
  post: Models.Document;
};
const PostCard = ({post}: PostCardProps) => {
    return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
            <img
              src={
                post.creator?.avatarUrl  ||
                "./icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-11 lg:h-11 rounded-full"
            />

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {post.creator?.userName}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular ">
                {multiFormatDateString(post.$createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Link to={`/posts/${post.$id}`}>
        <div className="small-medium lg:base-medium py-5">
          <p>{post.title}</p>
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
          src={post.imageUrl || "./icons/posts.svg"}
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