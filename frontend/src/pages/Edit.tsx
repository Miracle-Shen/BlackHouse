import PostForm from "@/components/PostForm";
import { useGetPostById } from "@/lib/react-query/queries";
import Loader from "@/components/common/Loader";
import { Link, useParams } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "@/context/AuthProvider";
const EditPage = () => {
  const { id } = useParams();
  let post;
  let isLoad= false;
  if(!id){
    const { data, isLoading } = useGetPostById(id);
    post = data;
    isLoad = isLoading;
  }
  const userInfo = localStorage.getItem("user");
  const userId = userInfo.userId;
  const creatorId = userInfo.id;

  
  if (isLoad && id)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <>
      {userId && id ?
      (<>
        <div className="bg-gray-50 flex">
          <div className="common-container">
            <div className="max-w-5xl justify-center  gap-3">
              <img
                src="/icons/gallery-add.svg"
                width={36}
                height={36}
                alt="add"
              />
              <h2 className="h3-bold md:h2-bold  ">{id ? "Edit Post" : "Create Post"}</h2>
            </div>

            <PostForm action={id ? "Update" : "Create"} post={post ? post : undefined} userId = {userId} creatorId={creatorId} />
          </div>
      </div>
    </>):
    (<div>
        <p className="text-center text-blue-500">
          <Link to="/login">点击这里登录</Link>
        </p>
      </div>)
    }
  </>
  )
}

export default EditPage 