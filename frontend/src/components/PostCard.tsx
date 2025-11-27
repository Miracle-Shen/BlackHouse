import { multiFormatDateString } from "@/lib/utils";
import { Link } from "react-router-dom";
const PostCard = ({post}) => {
    return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
            <img
              src={
                post.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-12 lg:h-12 rounded-full"
            />

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {post.userId}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular ">
                {multiFormatDateString(post.$createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* <Link
          to={`/update-post/${post.$id}`}>
          <img
            src={"/assets/icons/edit.svg"}
            alt="edit"
            width={20}
            height={20}
          />
        </Link> */}
      </div>

      <Link to={`/posts/${post.$id}`}>
        <div className="small-medium lg:base-medium py-5">
          <p>{post.title}</p>
          <p className="text-light-2">{post.caption}</p>
          {post?.tags ? (<ul className="flex gap-1 mt-2">
            {post.tags.map((tag: string, index: string) => (
              <li key={`${tag}${index}`} className="text-light-3 small-regular">
                #{tag}
              </li>
            ))}
          </ul>) : null}
        </div>

        <img
          src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="post image"
          className="post-card_img"
        />
      </Link>

      {/* <PostStats post={post} userId={user.id} /> */}
    </div>
  );
}

export default PostCard;