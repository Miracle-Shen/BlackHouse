import { useParams,  useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  useGetPostById,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
// import useAuth from "@/hooks/useAuth";
const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  // const { auth } = useAuth();
  const userInfoStr = localStorage.getItem("user");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null; // 解析为对象
  const userId = userInfo.$id;
  const { data: post, isLoading } = useGetPostById(id);

  const creatID = post?.creator ? (typeof post.creator === 'object' && post.creator !== null && '$id' in post.creator ? post.creator.$id : post.creator) : '';
  console.log('PostDetails creatID:', creatID);
  console.log('PostDetails userId:', userId);
  return (
    <div className="post_details-container">
      <div className="flex max-w-5xl w-full justify-between items-center">
        <div className="flex">  
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
        {userId === creatID && (
          <div className="flex gap-4">
            <Button
              onClick={() => navigate(`/edit/${post?.$id}`)}
              variant="ghost"
              className="shad-button_ghost"
            >
              <img
                src={"/icons/edit.svg"}
                alt="edit"
                width={24}
                height={24}
              />
              <p className="small-medium lg:base-medium">修改</p>
            </Button>
          </div>
        )}
      </div>

      {isLoading || !post ? (
        <div>这里是loading,请稍等...</div>
      ) : (
        <div className="post_details-card">
          <img
            src={post.imageUrl || "./icons/profile-placeholder.svg"}
            alt="imageUrl"
            className="post_details-img"
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              {/* <Link
                to={`/profile/${creatID}`}
                className="flex items-center gap-3"> */}
                <div className="flex items-center gap-3">
                <img
                  src={
                    post?.creator?.avatarUrl ||
                    "/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator?.userName}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular ">
                      {multiFormatDateString(post?.$createdAt)}
                    </p>
                  </div>
                </div>
                </div>
              {/* </Link> */}

            </div>
            <p className="text-lg font-bold">{post?.title}</p>
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
        {/* {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
      
        )} */}
      </div>
    </div>
  );
};

export default PostDetails;
