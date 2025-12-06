import { useParams,  useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  useGetPostById,
  useDeletePost,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useGlobalModal } from "@/context/ModalProvider";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const userInfoStr = localStorage.getItem("user");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null; 
  const userId = userInfo.$id;
  const { data: post } = useGetPostById(id);
  const { mutate: deletePost ,isPending: isDelete } = useDeletePost();
 const [activeTag, setActiveTag] = useState<string | null>(null);
  const creatID = post?.creator ? (typeof post.creator === 'object' && post.creator !== null && '$id' in post.creator ? post.creator.$id : post.creator) : '';
  const { showConfirm } = useGlobalModal();
  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
    
    showConfirm({
      title: "去发布！",
      description: "你可以基于这个标签创建一个新的帖子",
      cancelText: "取消",       
      confirmText: "去发布",      
      onCancel: () => {
      },
      onConfirm: () => {
        // 确认时跳转到发布页面（可以带上 tag 信息做重定向）
        navigate(`/edit?tag=${tag}`);
      },
    });
  };

  const handleDeletePost = () => {
     showConfirm({
      title: "确定删除该帖子吗？",
      description: "删除后将无法恢复，请谨慎操作。",
      cancelText: "取消",         
      confirmText: "删除",       
      onCancel: () => {
      },
      onConfirm: () => {
        deletePost({ postId: id, imageId: post?.imageId });
        navigate('/');
      },
    });

  };
   return (
    <div className="post_details-container mx-auto w-full max-w-5xl px-4 pb-10 pt-4 md:px-6 lg:px-8">
      {/* 顶部操作栏：返回 + 编辑 / 删除 */}
      <div className="flex w-full items-center justify-between gap-3">
        <Button
          onClick={() => navigate(`/`)}
          variant="ghost"
          className="shad-button_ghost flex items-center gap-2 px-0"
        >
          <img src={"/icons/back.svg"} alt="back" width={22} height={22} />
          <p className="small-medium lg:base-medium">返回</p>
        </Button>

        {userId === creatID && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate(`/edit/${post?.$id}`)}
              variant="ghost"
              className="shad-button_ghost flex items-center gap-1 px-2 py-1 md:px-3"
            >
              <img src={"/icons/edit.svg"} alt="edit" width={18} height={18} />
              <p className="small-medium hidden xs:block lg:base-medium">
                修改
              </p>
            </Button>

            <Button
              onClick={handleDeletePost}
              variant="ghost"
              disabled={isDelete}
              className="shad-button_ghost flex items-center gap-1 px-2 py-1 md:px-3"
            >
              {isDelete ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <img
                  src={"/icons/delete.svg"}
                  alt="delete"
                  width={18}
                  height={18}
                />
              )}
              <p className="small-medium hidden xs:block lg:base-medium">
                删除
              </p>
            </Button>
          </div>
        )}
      </div>

      {/* 主体卡片：移动端纵向，平板以上左右布局 */}
      <div className="post_details-card mt-4 flex w-full flex-col gap-4 rounded-2xl bg-dark-2/80 p-3 shadow-lg md:mt-6 md:flex-row md:p-4 lg:p-6">
        {/* 图片区域：移动端全宽，上下布局；大屏左侧 */}
        <div className="w-full md:w-1/2">
          <img
            src={post?.imageUrl || "./icons/profile-placeholder.svg"}
            alt="imageUrl"
            className="post_details-img h-auto w-full max-h-[70vh] rounded-xl object-cover md:max-h-[65vh]"
          />
        </div>

        {/* 信息区域：标题、作者、时间、内容、tag */}
        <div className="post_details-info flex w-full flex-1 flex-col gap-4 md:w-1/2 md:pl-2 lg:pl-4">
          {/* 作者 + 时间 */}
          <div className="flex-between w-full">
            <div className="flex items-center gap-3">
              <img
                src={
                  (post?.creator as any)?.avatarUrl ||
                  "/icons/profile-placeholder.svg"
                }
                alt="creator"
                className="h-10 w-10 rounded-full object-cover lg:h-12 lg:w-12"
              />
              <div className="flex flex-col gap-1">
                <p className="base-medium lg:body-bold text-light-1">
                  {(post?.creator as any)?.userName}
                </p>
                <div className="flex-center gap-2 text-light-3">
                  <p className="subtle-semibold lg:small-regular">
                    {multiFormatDateString(post?.$createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 标题 */}
          <p className="text-base font-semibold text-light-1 md:text-lg lg:text-xl mt-2">
            {post?.title}
          </p>

          <hr className="border border-primary-50" />

          {/* 文本 + 标签 */}
          <div className="flex w-full flex-1 flex-col gap-3 small-regular md:small-medium lg:base-regular">
            <p className="leading-relaxed text-light-2">{post?.caption}</p>

            {post?.tags && post.tags.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {post.tags.map((tag: string, index: number) => {
                  const isActive = activeTag === tag;
                  return (
                    <button
                      type="button"
                      key={`${tag}-${index}`}
                      onClick={() => handleTagClick(tag)}
                      className={`tag-chip ${
                        isActive ? "tag-chip--active" : ""
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* 推荐区域 */}
      <div className="mt-8 w-full max-w-5xl">
        <hr className="border border-dark-4/80" />
        <h3 className="body-bold md:h3-bold my-6 w-full text-light-1">
          更多推荐
        </h3>
        {/* 相关内容列表 */}
        {/* <GridPostList posts={relatedPosts} /> */}
      </div>
    </div>
  );
};

export default PostDetails;
