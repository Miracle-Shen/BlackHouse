import React, { useRef, useState } from "react";

type PullToRefreshProps = {
  onRefresh: () => Promise<any> | any; // 可以是 async 或普通函数
  children: React.ReactNode;
  /** 触发刷新的最小下拉距离（px） */
  threshold?: number;
  /** 允许下拉的最大距离（px） */
  maxPull?: number;
};

/**
 * 一个简单的「下拉刷新」容器
 * - 仅在页面滚动到顶部时生效（window.scrollY === 0）
 * - 通过 touch 事件计算下拉距离
 * - 松手时超过阈值 -> 调用 onRefresh
 */
const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 60,
  maxPull = 90,
}) => {
  const startYRef = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState<"idle" | "pull" | "refreshing">("idle");

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // 只在页面已在顶部时允许下拉刷新
    if (window.scrollY > 0 || status === "refreshing") return;
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startYRef.current === null || status === "refreshing") return;

    const currentY = e.touches[0].clientY;
    const delta = currentY - startYRef.current;

    // 只处理“向下拉”的情况
    if (delta <= 0) return;

    // 阻止浏览器默认的下拉弹性 / 刷新行为
    e.preventDefault();

    const pullDistance = Math.min(delta, maxPull);
    setOffset(pullDistance);
    setStatus("pull");
  };

  const handleTouchEnd = async () => {
    if (startYRef.current === null) return;

    // 松手时，如果拉动超过阈值 -> 触发刷新
    if (status === "pull" && offset >= threshold) {
      try {
        setStatus("refreshing");
        setOffset(threshold); // 保持一点下拉状态，给用户反馈
        await onRefresh();
      } finally {
        // 刷新完成后收回
        setOffset(0);
        setStatus("idle");
        startYRef.current = null;
      }
    } else {
      // 没有达到阈值，直接收回
      setOffset(0);
      setStatus("idle");
      startYRef.current = null;
    }
  };

  const tipsText =
    status === "refreshing"
      ? "刷新中…"
      : offset >= threshold
      ? "松手立即刷新"
      : offset > 0
      ? "下拉刷新"
      : "";

  return (
    <div
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 顶部提示条 */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex h-8 items-center justify-center text-[11px] text-slate-400">
        {tipsText}
      </div>

      {/* 内容整体下移 */}
      <div
        style={{
          transform: `translateY(${offset}px)`,
          transition:
            status === "idle" || status === "refreshing"
              ? "transform 0.2s ease-out"
              : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
