import { useEffect, useRef, useState } from "react";
import PostForm from "@/components/PostForm";
import { useGetPostById } from "@/lib/react-query/queries";
import Loader from "@/components/common/Loader";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { INewPost } from "@/types";
import useAuth from "@/hooks/useAuth";

const EditPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const draftKey = `draft_${creatorId || "guest"}_${id ?? "new"}${
    urlTag ? `_${urlTag}` : ""
  }`;
  const [autoSavedAt, setAutoSavedAt] = useState<number | null>(null);

  // ===== AI 相关状态 =====
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTypingContent, setAiTypingContent] = useState("");
  const [showAiConfirm, setShowAiConfirm] = useState(false);

  // 用来做打字机计时器
  const typingTimerRef = useRef<number | null>(null);

  // 流式完整文本缓冲区
  const fullTextRef = useRef<string>("");
  // 标记后端是否已经完成推流
  const streamDoneRef = useRef<boolean>(false);

  // === 打字机：从 fullTextRef 中“边流边打字” ===
  const startStreamingTyping = () => {
    setAiTypingContent("");
    if (typingTimerRef.current) {
      window.clearInterval(typingTimerRef.current);
    }

    let index = 0;

    const timer = window.setInterval(() => {
      const fullText = fullTextRef.current;

      // 如果还有没打出来的字符，就多打一个
      if (index < fullText.length) {
        index += 1;
        const current = fullText.slice(0, index);
        setAiTypingContent(current);
        return;
      }

      // 已经把当前缓冲区打完了，但流还没完全结束，就先等下一轮
      if (!streamDoneRef.current) {
        return;
      }

      // 文本打完 & 流结束 -> 收尾
      window.clearInterval(timer);
      typingTimerRef.current = null;
      setAiLoading(false);
      setShowAiConfirm(true);
    }, 30);

    typingTimerRef.current = timer;
  };

  // 当 URL 中存在 ?tag=xxx 时，进入页面自动请求模型（SSE 流式）
  useEffect(() => {
    if (!urlTag) return;

    let cancelled = false;
    let es: EventSource | null = null;

    const startStream = () => {
      setAiLoading(true);
      setAiTypingContent("");
      setShowAiConfirm(false);

      fullTextRef.current = "";
      streamDoneRef.current = false;
      const threadId = "";

      const query = new URLSearchParams({
        tag: urlTag,
        thread_id: threadId,
      });

      // es = new EventSource(`/chat?${query.toString()}`);
      es = new EventSource(`/chat?${query.toString()}`);

      // 第一次建立连接时，启动打字机
      es.onopen = () => {
        if (cancelled) return;
        startStreamingTyping();
      };

      // 每个 message 是一小段文本 chunk
      es.onmessage = (event) => {
        if (cancelled) return;
        const chunk = event.data;
        if (!chunk) return;

        // 累加到完整文本缓冲区
        fullTextRef.current += chunk;
      };

      // 服务端主动发的 `event: done`
      es.addEventListener("done", () => {
        if (cancelled) return;
        streamDoneRef.current = true;
        es?.close();
        es = null;
      });

      // 服务端主动发的 `event: error` 或网络错误
      es.addEventListener("error", (event) => {
        console.error("[EditPage AI] SSE error event", event);
        if (cancelled) return;

        streamDoneRef.current = true; // 停止打字机
        setAiLoading(false);

        es?.close();
        es = null;
      });
    };

    startStream();

    // 清理函数：路由切换 / 组件卸载时关闭 SSE + timer
    return () => {
      cancelled = true;
      if (es) {
        es.close();
      }
      if (typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [urlTag]);

  // ===== AI 弹窗的交互 =====
  const handleAcceptAi = () => {
    setShowAiConfirm(false);
    // 保留 aiTypingContent -> PostForm 继续使用
  };

  const handleRejectAi = () => {
    setShowAiConfirm(false);
    setAiTypingContent("");
    fullTextRef.current = "";
  };

  const aiCaptionForForm = aiTypingContent || undefined;

  if (isLoad && id) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="mx-auto flex w-full max-w-2xl flex-col px-4 pb-8 pt-4 sm:pt-8">
          {/* 顶部栏：返回 + 标题 */}
          <header className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full border border-transparent px-3 py-1 text-sm text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-700"
            >
              ← 返回
            </button>

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
                {autoSavedAt && (
                  <p className="mt-1 text-[10px] text-slate-400">
                    草稿已于 {new Date(autoSavedAt).toLocaleTimeString()} 自动保存
                  </p>
                )}
              </div>
            </div>

            {/* 表单主体 */}
            <PostForm
              action={id ? "Update" : "Create"}
              post={post}
              creatorId={creatorId}
              aiCaption={aiCaptionForForm}
              tags={urlTag ? [urlTag] : post?.tags}
              draftKey={draftKey}
              onAutoSave={(ts) => setAutoSavedAt(ts)} 
            />
          </section>
        </div>

        {/* AI 生成中的提示：底部气泡 */}
        {aiLoading && urlTag && (
          <div className="pointer-events-none fixed inset-0 z-30 flex items-end justify-center bg-black/30 sm:items-center">
            <div className="pointer-events-auto mb-6 w-full max-w-xs rounded-2xl bg-white px-4 py-3 text-center text-sm text-slate-700 shadow-lg sm:mb-0">
              <p className="mb-1">
                正在为你根据话题{" "}
                <span className="font-semibold text-blue-500">#{urlTag}</span>{" "}
                生成推荐内容…
              </p>
              <p className="text-[11px] text-slate-400">请耐心等待几秒钟。</p>
            </div>
          </div>
        )}

        {/* 模型输出完毕后的确认弹窗 */}
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
