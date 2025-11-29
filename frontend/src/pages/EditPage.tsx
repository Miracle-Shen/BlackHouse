import PostForm from "@/components/PostForm";
import { useGetPostById } from "@/lib/react-query/queries";
import Loader from "@/components/common/Loader";
import { useParams } from "react-router-dom";

const EditPage = () => {
  const { id } = useParams();
  const { data: post, isLoading } = useGetPostById(id);

  if (isLoading && id)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
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

          <PostForm action={id ? "Update" : "Create"} post={post ? post : undefined} />
        </div>
    </div>
  )
}

export default EditPage 