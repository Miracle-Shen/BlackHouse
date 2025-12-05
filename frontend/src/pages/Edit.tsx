import { useEffect, useRef, useState } from "react";
import PostForm from "@/components/PostForm";
import { useGetPostById } from "@/lib/react-query/queries";
import Loader from "@/components/common/Loader";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { INewPost } from "@/types";

const EditPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tag = searchParams.get("tag") || "";

  // ===== 原来用于获取 post 的逻辑（保持你的结构） =====
  let post: INewPost | undefined;
  let isLoad = false;
  if (id) {
    const { data, isLoading } = useGetPostById(id);
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

  const userInfoStr = localStorage.getItem("user");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const creatorId = userInfo?.$id || "";

  // ===== 新增：AI 相关状态 =====
  const [aiLoading, setAiLoading] = useState(false);        // 是否正在向模型请求
  const [aiFullContent, setAiFullContent] = useState("");   // 模型完整返回的内容
  const [aiTypingContent, setAiTypingContent] = useState(""); // 打字机展示内容
  const [showAiConfirm, setShowAiConfirm] = useState(false);  // 是否展示“接受推荐内容？”弹窗
  const [aiAcceptedCaption, setAiAcceptedCaption] = useState<string | undefined>(undefined); // 用户确认后真正用于表单的 caption

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
      setAiTypingContent(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
        typingTimerRef.current = null;
        setAiLoading(false);
        setShowAiConfirm(true);
      }
    }, 30); // 30ms 一个字符
    typingTimerRef.current = timer;
  };

  // 当 URL 中存在 ?tag=xxx 时，进入页面自动请求模型
  useEffect(() => {
    // 没 tag 就不调模型
    if (!tag) return;

    let cancelled = false;

    const fetchContent = async () => {
      try {
        setAiLoading(true);
        setAiFullContent("");
        setAiTypingContent("");
        setShowAiConfirm(false);
        setAiAcceptedCaption(undefined);

        const resp = await fetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tag }),
        });

        if (!resp.ok) {
          throw new Error("network error");
        }

        const data = await resp.json();
        if (!data.ok) {
          throw new Error(data.error?.message || "model error");
        }

        const text: string = data.data.content;
        if (cancelled) return;

        setAiFullContent(text);
        // 非流式：拿到完整文本后再本地打字机
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
  }, [tag]);

  // 用户点击“接受推荐内容”
  const handleAcceptAi = () => {
    setAiAcceptedCaption(aiFullContent);
    setShowAiConfirm(false);
  };

  // 用户点击“重新自己写”
  const handleRejectAi = () => {
    setAiAcceptedCaption(undefined);
    setShowAiConfirm(false);
    setAiFullContent("");
    setAiTypingContent("");
  };

  // 把 AI 生成的 caption 合并进传给 PostForm 的 post 对象
  // - 有 id（编辑）：覆盖原 caption
  // - 无 id（创建）：构造一个仅有 caption 的对象也可以，PostForm 内部如果只按需取字段就不会报错
  let finalPost: INewPost | undefined = post;
  if (aiAcceptedCaption) {
    if (post) {
      finalPost = { ...post, caption: aiAcceptedCaption };
    } else {
      finalPost = {
        $id: "",
        title: "",
        creator: undefined,
        imageUrl: "",
        imageId: "",
        caption: aiAcceptedCaption,
        tags: [],
      };
    }
  }

  // ===== 原来的 loading 判断（保持不动） =====
  if (isLoad && id)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <>
      {creatorId ? (
        <>
          <div className="bg-gray-50 flex">
            <div className="common-container relative">
              {/* 顶部标题区域：保持原结构 */}
              <div className="flex max-w-5xl justify-center items-center gap-3">
                <img
                  src="/icons/gallery-add.svg"
                  width={36}
                  height={36}
                  alt="add"
                />
                <h2 className="h3-bold md:h2-bold">
                  {id ? "编辑 Post" : "创建 Post"}
                </h2>
              </div>

              {/* 如果有 tag，显示一下当前话题提示 */}
              {tag && (
                <div className="mt-3 text-sm text-gray-600 text-center">
                  当前基于话题 <span className="font-semibold text-blue-500">#{tag}</span> 生成推荐内容
                </div>
              )}

              {/* 遮罩蒙层：AI 正在生成时 */}
              {aiLoading && tag && (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
                  <div className="bg-white rounded-lg px-6 py-4 shadow-md">
                    <p className="text-gray-700 text-sm">
                      正在为你根据话题 <span className="font-semibold text-blue-500">#{tag}</span> 生成推荐内容…
                    </p>
                  </div>
                </div>
              )}

              {/* 打字机预览区域 */}
              {aiTypingContent && tag && (
                <div className="mt-6 max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">
                    AI 推荐内容预览（可稍后选择是否填入表单）
                  </div>
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {aiTypingContent}
                    {aiLoading && <span className="animate-pulse">▍</span>}
                  </pre>
                </div>
              )}

              {/* 原来的 PostForm：只是在这里把 post 换成 finalPost */}
              <PostForm
                action={id ? "Update" : "Create"}
                post={finalPost ? finalPost : undefined}
                creatorId={creatorId}
              />
            </div>
          </div>

          {/* 模型输出完毕后的确认弹窗 */}
          {showAiConfirm && tag && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
                <h3 className="text-lg font-semibold mb-2">使用推荐内容？</h3>
                <p className="text-sm text-gray-700 mb-4">
                  已为你生成一段基于话题 <span className="font-semibold text-blue-500">#{tag}</span> 的推荐内容。
                  需要将这段内容填入表单吗？
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleRejectAi}
                    className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700"
                  >
                    重新自己写
                  </button>
                  <button
                    onClick={handleAcceptAi}
                    className="px-3 py-1.5 text-sm rounded bg-blue-500 text-white"
                  >
                    接受并填充表单
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div>
          <p className="text-center text-blue-500">
            <Link to="/login">点击这里登录</Link>
          </p>
        </div>
      )}
    </>
  );
};

export default EditPage;
