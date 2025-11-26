import PostForm from "@/components/PostForm"

const PublishPage = () => {
  return (
      <div className="bg-gray-50 flex">
        <div className="common-container">
          <div className="max-w-5xl justify-center  gap-3">
            <img
              src="/src/assets/react.svg"
              width={36}
              height={36}
              alt="add"
            />
            <h2 className="h3-bold md:h2-bold  ">Create Post</h2>
          </div>

          <PostForm action="Create" />
        </div>
    </div>
  )
}

export default PublishPage