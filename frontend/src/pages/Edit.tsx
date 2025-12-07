import { useEffect, useRef, useState } from "react";
import PostForm from "@/components/PostForm";
import { useGetPostById } from "@/lib/react-query/queries";
import Loader from "@/components/common/Loader";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { INewPost } from "@/types";
import axios from "@/api/axios";
import useAuth from "@/hooks/useAuth";
const EditPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const urlTag = searchParams.get("tag") || ""; 
  const { data, isLoading } = useGetPostById(id || "");
  const { auth } = useAuth();
  // ===== 获取 post 的逻辑 =====
  let post: INewPost | undefined;
  let isLoad = false;
  if (id) { 
    post = {
      $id: data ? data.$id : "",
      title: data?.title,
      creator: data?.creator,
      imageUrl: data?.imageUrl,
      imageId: data?.imageId,
      caption: data?.caption,
      tags: data?.tags,
    };
    isLoad = isLoading;
  }

  const creatorId = auth?.$id || "";

  // ===== AI 相关状态 =====
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTypingContent, setAiTypingContent] = useState("");
  const [showAiConfirm, setShowAiConfirm] = useState(false);

  const typingTimerRef = useRef<number | null>(null);

  // 打字机效果
  const startTyping = (text: string) => {
    setAiTypingContent("");
    if (typingTimerRef.current) {
      window.clearInterval(typingTimerRef.current);
    }
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      const current = text.slice(0, index);
      setAiTypingContent(current);

      if (index >= text.length) {
        window.clearInterval(timer);
        typingTimerRef.current = null;
        setAiLoading(false);
        setShowAiConfirm(true);
      }
    }, 30);
    typingTimerRef.current = timer;
  };

  // 当 URL 中存在 ?tag=xxx 时，进入页面自动请求模型
  useEffect(() => {
    if (!urlTag) return;

    let cancelled = false;

    const fetchContent = async () => {
      try {
        setAiLoading(true);
        setAiTypingContent("");
        setShowAiConfirm(false);

       const resp = await axios.post<{ 
        ok: boolean; 
        data: { content: string }; 
        error?: { message: string }; 
      }>("/chat", { tag: urlTag });


        if (!resp.data.ok) {
          throw new Error("network error");
        }

        const data = resp.data;
        if (!data.ok) {
          throw new Error(data.error?.message || "model error");
        }

        const text: string = data.data.content;
        if (cancelled) return;

        startTyping(text);
      } catch (e) {
        console.error("[EditPage AI]", e);
        if (!cancelled) {
          setAiLoading(false);
        }
      }
    };

    fetchContent();

    return () => {
      cancelled = true;
      if (typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current);
      }
    };
  }, [urlTag]);

  const handleAcceptAi = () => {
    setShowAiConfirm(false);
    setAiTypingContent("");
  };

  const handleRejectAi = () => {
    setShowAiConfirm(false);
    setAiTypingContent("");
  };

  const aiCaptionForForm = aiTypingContent || undefined;

  if (isLoad && id)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader />
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="mx-auto flex w-full max-w-2xl flex-col px-4 pb-8 pt-4 sm:pt-8">
          {/* 顶部栏：返回 + 标题 */}
          <header className="mb-4 flex items-center justify-between gap-3">
            <Link
              to={-1 as unknown as string}
              className="rounded-full border border-transparent px-3 py-1 text-sm text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-700"
            >
              ← 返回
            </Link>

            <span className="text-[11px] tracking-wide text-slate-400">
              {id ? "编辑内容" : "发布新内容"}
            </span>
          </header>

          {/* 卡片主体 */}
          <section className="rounded-2xl bg-white px-4 py-5 shadow-sm ring-1 ring-slate-100 sm:px-6 sm:py-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <img
                  src="/icons/gallery-add.svg"
                  width={22}
                  height={22}
                  alt="add"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-slate-900">
                  {id ? "编辑 Post" : "创建 Post"}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {urlTag
                    ? `当前话题 #${urlTag}，试着用一段文字记录你的想法吧。`
                    : "简单几步，分享你的图片和文字。"}
                </p>
              </div>
            </div>

            {/* 表单主体 */}
            <PostForm
              action={id ? "Update" : "Create"}
              post={post}
              creatorId={creatorId}
              aiCaption={aiCaptionForForm}
              tags={urlTag?[urlTag]:post?.tags}
            />
          </section>
        </div>

        {/* AI 生成中的提示：底部气泡*/}
        {aiLoading && urlTag && (
          <div className="pointer-events-none fixed inset-0 z-30 flex items-end justify-center bg-black/30 sm:items-center">
            <div className="pointer-events-auto mb-6 w-full max-w-xs rounded-2xl bg-white px-4 py-3 text-center text-sm text-slate-700 shadow-lg sm:mb-0">
              <p className="mb-1">
                正在为你根据话题{" "}
                <span className="font-semibold text-blue-500">#{urlTag}</span>{" "}
                生成推荐内容…
              </p>
              <p className="text-[11px] text-slate-400">
                请耐心等待几秒钟。
              </p>
            </div>
          </div>
        )}

        {/* 模型输出完毕后的确认弹窗：移动端居中弹出 */}
        {showAiConfirm && urlTag && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
              <h3 className="mb-2 text-base font-semibold text-slate-900">
                使用推荐内容？
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-slate-700">
                已为你生成一段基于话题{" "}
                <span className="font-semibold text-blue-500">#{urlTag}</span>{" "}
                的推荐内容，是否保留这段文字？
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={handleRejectAi}
                  className="h-9 w-full rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 sm:w-auto"
                >
                  重新自己写
                </button>
                <button
                  onClick={handleAcceptAi}
                  className="h-9 w-full rounded-full bg-blue-500 text-sm font-medium text-white hover:bg-blue-600 sm:w-auto"
                >
                  保留这段内容
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EditPage;
