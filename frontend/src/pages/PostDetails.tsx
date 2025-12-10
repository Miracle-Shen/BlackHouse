import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  useGetPostById,
  useDeletePost,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useGlobalModal } from "@/context/ModalProvider";
import useAuth from "../hooks/useAuth";
import axios from "@/api/axios";
import GridPostList from "@/components/common/GridPostList";
import type { INewPost } from "@/types";


const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { auth } = useAuth();
  const userId = auth?.$id || "";
  const { data: post, isLoading } = useGetPostById(id);
  const { mutate: deletePost, isPending: isDelete } = useDeletePost();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { showConfirm } = useGlobalModal();

  const [relatedPosts, setRelatedPosts] = useState<INewPost[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  const creatorId =
    typeof post?.creator === "object" && post?.creator !== null
      ? (post.creator as any).$id
      : (post?.creator as string) || "";

  const handleTagClick = (tag: string) => {
    setActiveTag(tag);

    showConfirm({
      title: "去发布！",
      description: "你可以基于这个标签创建一个新的帖子。",
      cancelText: "取消",
      confirmText: "去发布",
      onCancel: () => {},
      onConfirm: () => {
        navigate(`/edit?tag=${encodeURIComponent(tag)}`);
      },
    });
  };

  // 拉取推荐数据
  useEffect(() => {
    const fetchRelatedPosts = async () => {
      if (!post?.tags || post.tags.length === 0) return;

      try {
        setIsLoadingRelated(true);
        const res = await axios.get("/recommand", {
          params: { 
            tags: post.tags, 
            postId:post.$id },
        });
        if(res.data.ok !== true) {
          console.error("获取推荐帖子失败：", res.data);
          return;
        }
        // 根据你的后端返回结构调整
        setRelatedPosts(res.data?.data  || []);
      } catch (error) {
        console.error("获取推荐帖子失败：", error);
      } finally {
        setIsLoadingRelated(false);
      }
    };

    fetchRelatedPosts();
  }, [post?.tags]);

  const handleDeletePost = () => {
    if (!id) return;

    showConfirm({
      title: "确定删除该帖子吗？",
      description: "删除后将无法恢复，请谨慎操作。",
      cancelText: "取消",
      confirmText: "删除",
      onCancel: () => {},
      onConfirm: () => {
        deletePost({ postId: id, imageId: post?.imageId });
        navigate("/");
      },
    });
  };

  // 加一个加载态，移动端全屏居中
  if (isLoading || !post) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
          <Loader className="h-5 w-5 animate-spin text-slate-500" />
          <p className="text-xs text-slate-500">正在加载内容...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-4 sm:pt-6">
        {/* 顶部操作栏：返回 + 编辑 / 删除 */}
        <header className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 text-xs text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-700"
          >
            <img src={"/icons/back.svg"} alt="back" width={18} height={18} />
            <span>返回</span>
          </button>

          {userId === creatorId && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                onClick={() => navigate(`/edit/${post.$id}`)}
                variant="ghost"
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-slate-600 hover:bg-white sm:px-3"
              >
                <img src={"/icons/edit.svg"} alt="edit" width={16} height={16} />
                <span className="hidden xs:inline">修改</span>
              </Button>

              <Button
                onClick={handleDeletePost}
                variant="ghost"
                disabled={isDelete}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-red-500 hover:bg-white sm:px-3"
              >
                {isDelete ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <img
                    src={"/icons/delete.svg"}
                    alt="delete"
                    width={16}
                    height={16}
                  />
                )}
                <span className="hidden xs:inline">删除</span>
              </Button>
            </div>
          )}
        </header>

        {/* 主体卡片 */}
        <section className="mt-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100 sm:mt-6 sm:p-5">
          {/* 标题 + 简要信息 */}
          <div className="mb-3 flex flex-col gap-2 sm:mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img
                  src={
                    (post.creator as any)?.avatarUrl ||
                    "/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-800 sm:text-sm">
                    {(post.creator as any)?.userName || "匿名用户"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {multiFormatDateString(post.$createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 图片 + 文本区域：移动端上下，平板开始左右 */}
          <div className="grid gap-4 sm:gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start">
            {/* 图片区域 */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={post.imageUrl || "./icons/profile-placeholder.svg"}
                alt="post-image"
                className="h-full w-full max-h-[70vh] object-cover"
              />
            </div>

            {/* 文本 + 标签区域 */}
            <div className="flex flex-col gap-3 md:gap-4">
              <h1 className="text-base font-semibold text-slate-900 sm:text-lg">
                {post.title}
              </h1>
              <div className="rounded-2xl bg-slate-50/80 px-3 py-3 sm:px-4 sm:py-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                  {post.caption}
                </p>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="mt-1">
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    相关标签
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {post.tags.map((tag: string, index: number) => {
                      const isActive = activeTag === tag;
                      return (
                        <button
                          type="button"
                          key={`${tag}-${index}`}
                          onClick={() => handleTagClick(tag)}
                          className={[
                            "inline-flex items-center rounded-full border px-3 py-1 text-xs",
                            "transition-colors",
                            isActive
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </ul>
                  <p className="mt-1 text-[11px] text-slate-400">
                    点击标签，可以体验AI智能创作，快速发布相同话题。
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 推荐区域 */}
        <section className="mt-8 w-full">
          <hr className="border-slate-200" />
          <div className="mt-6 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
              更多推荐
            </h3>
            <span className="text-[11px] text-slate-400">
              根据你当前浏览内容推荐
            </span>
          </div>

          <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6">
            {isLoadingRelated ? (
              <div className="flex flex-col items-center gap-2 text-center text-[12px] text-slate-400">
                <Loader className="h-4 w-4 animate-spin" />
                <span>正在为你加载推荐内容...</span>
              </div>
            ) : relatedPosts.length > 0 ? (
              <GridPostList posts={relatedPosts} />
            ) : (
              <p className="text-center text-[12px] text-slate-400">
                暂时没有推荐内容，试试浏览其他帖子吧。
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PostDetails;
