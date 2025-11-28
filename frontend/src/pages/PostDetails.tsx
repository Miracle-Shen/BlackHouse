import { useParams, Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
// import { Loader } from "@/components/shared";
// import { GridPostList, PostStats } from "@/components/shared";

import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
// import { useUserContext } from "@/context/AuthContext";
import AuthContext from "@/context/AuthProvider";
import { useContext } from "react";
import { Loader } from "lucide-react";
const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { auth } = useContext(AuthContext);
  const userId = auth.userId;

  const { data: post, isLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.userId
  );
  const { mutate: deletePost } = useDeletePost();
  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );
    console.log("当前用户ID",userId);
    console.log("帖子用户",post);
  const handleDeletePost = () => {
    deletePost({ postId: id, imageId: post?.imageId });
    navigate(-1);
  };

  return (
    <div className="post_details-container">
      <div className=" md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(`/`)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <div>这里是loading</div>
      ) : (
        <div className="post_details-card">
          <img
            src={post?.imageUrl}
            alt="imageUrl"
            className="post_details-img"
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post?.userId}`}
                className="flex items-center gap-3">
                <img
                  src={
                    post?.imageUrl ||
                    "/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.userId}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular ">
                      {multiFormatDateString(post?.$createdAt)}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex-center gap-4">
                <Link
                  to={`/publish/${post?.$id}`}
                  className={`${userId !== post?.userId && "hidden"}`}>
                  <img
                    src={"/icons/edit.svg"}
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`ost_details-delete_btn ${
                    userId !== post?.userId && "hidden"
                  }`}>
                  <img
                    src={"/icons/delete.svg"}
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>
            <p>{post?.title}</p>
            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
            
              <p>{post?.caption}</p>
              {post?.tags ? 
              (<ul className="flex gap-1 mt-2">
                {post?.tags.map((tag: string, index: string) => (
                  <li
                    key={`${tag}${index}`}
                    className="text-light-3 small-regular">
                    #{tag}
                  </li>
                ))}
              </ul>) :
                <>  </>}
            </div>
{/* 
            <div className="w-full">
              <PostStats post={post} userId={userId} />
            </div> */}
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />
        <h3 className="body-bold md:h3-bold w-full my-10">
            更多推荐
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
        //   <GridPostList posts={relatedPosts} />
            <div>更多推荐内容</div>
        )}
      </div>
    </div>
  );
};

export default PostDetails;
