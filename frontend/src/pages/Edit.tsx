import PostForm from "@/components/PostForm";
import { useGetPostById } from "@/lib/react-query/queries";
import Loader from "@/components/common/Loader";
import { Link, useParams } from "react-router-dom";
import type {INewPost} from '@/types'
const EditPage = () => {
  const { id } = useParams();
  let post: INewPost | undefined;
  let isLoad= false;
  if(!id){
    const { data, isLoading } = useGetPostById(id);
    post ={
      $id: data ? data.$id : '',
      title: data?.title, 
      creator: data?.creator,
      imageUrl: data?.imageUrl,
      imageId: data?.imageId,
      caption: data?.caption,
      tags: data?.tags,
    };
    isLoad = isLoading;
  }
const userInfoStr = localStorage.getItem("user");
const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null; // 解析为对象
// const userId = userInfo?.userId; // 可选链避免 null 错误
const creatorId = userInfo?.$id || ''; // 如果 userInfo 或 userId 为 null，则使用空字符串
console.log('User Info:', userInfo);
console.log('Creator ID:', creatorId);

  if (isLoad && id)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <>
      {creatorId ?
      (<>
        <div className="bg-gray-50 flex">
          <div className="common-container">
            <div className="flex max-w-5xl justify-center items-center gap-3">
              <img
                src="/icons/gallery-add.svg"
                width={36}
                height={36}
                alt="add"
              />
              <h2 className="h3-bold md:h2-bold  ">{id ? "编辑 Post" : "创建 Post"}</h2>
            </div>

            <PostForm action={id ? "Update" : "Create"} post={post ? post : undefined}  creatorId={creatorId} />
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