import React, { useEffect, useRef, useState } from "react";

type PullToRefreshProps = {
  onRefresh: () => Promise<any> | any;
  scrollRef: React.RefObject<HTMLElement | null>; // ✅ 必传：你的滚动容器 ref
  children: React.ReactNode;
  threshold?: number;
  maxPull?: number;
};

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  scrollRef,
  children,
  threshold = 60,
  maxPull = 90,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const startYRef = useRef<number | null>(null);

  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState<"idle" | "pull" | "refreshing">("idle");

  // ✅ 是否允许开始下拉：滚动容器必须在顶部
  const canStartPull = () => {
    const scroller = scrollRef.current;
    if (!scroller) return false;
    return scroller.scrollTop <= 0 && status !== "refreshing";
  };

  // 触摸开始：记录起点
  const onTouchStart = (e: TouchEvent) => {
    if (!canStartPull()) return;
    startYRef.current = e.touches[0].clientY;
  };
  const ACTIVATION_DISTANCE = 10;

  // 触摸移动：计算距离、必要时阻止默认滚动
  const onTouchMove = (e: TouchEvent) => {
    if (startYRef.current === null || status === "refreshing") return;

    const scroller = scrollRef.current;
    if (!scroller || scroller.scrollTop > 0) return;

    const delta = e.touches[0].clientY - startYRef.current;

    // 关键：小位移直接忽略
    if (delta < ACTIVATION_DISTANCE) return;
    if (delta <= 0) return;

    e.preventDefault();

    const pull = Math.min(delta, maxPull);
    setOffset(pull);
    setStatus("pull"); // ✅ 只有这里才进入 pull
  };


  // 触摸结束：决定是否刷新
  const onTouchEnd = async () => {
    //没有进入 pull 状态，直接重置
    if (status !== "pull") {
      startYRef.current = null;
      setOffset(0);
      return;
    }

    if (offset >= threshold) {
      try {
        setStatus("refreshing");
        setOffset(threshold);
        await onRefresh();
      } finally {
        setOffset(0);
        setStatus("idle");
        startYRef.current = null;
      }
    } else {
      setOffset(0);
      setStatus("idle");
      startYRef.current = null;
    }
  };


  // ✅ 用原生事件绑定，touchmove 设置 passive:false
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false }); // ✅ 关键
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart as any);
      el.removeEventListener("touchmove", onTouchMove as any);
      el.removeEventListener("touchend", onTouchEnd as any);
      el.removeEventListener("touchcancel", onTouchEnd as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, offset, threshold, maxPull, onRefresh, scrollRef]);

  const tipsText =
    status === "refreshing"
      ? "刷新中…"
      : offset >= threshold
      ? "松手立即刷新"
      : offset > 0
      ? "下拉刷新"
      : "";

  return (
    <div ref={rootRef} className="relative">
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex h-8 items-center justify-center text-[11px] text-slate-400">
        {tipsText}
      </div>

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
