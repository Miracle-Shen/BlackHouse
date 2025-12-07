import React, { memo, useMemo } from "react";
import type { CSSProperties } from "react";

type Interest = {
  interest: string;
  relevanceScore: number;
};

type InterestCloudProps = {
  interests: Interest[];
};

const InterestCloud: React.FC<InterestCloudProps> = ({ interests }) => {
  // 按相关度由高到低排序，视觉上更舒服
  const sortedInterests = useMemo(
    () => [...interests].sort((a, b) => b.relevanceScore - a.relevanceScore),
    [interests]
  );

  const getBubbleStyle = (score: number): CSSProperties => {
    const s = Math.max(0, Math.min(1, score ?? 0)); // 0 ~ 1

    const fontSize = 0.8 + s * 0.45; // 0.8rem ~ 1.25rem
    const paddingY = 0.2 + s * 0.22;
    const paddingX = 0.9 + s * 0.5;
    const opacity = 0.55 + s * 0.35; // 越重要越“实”

    return {
      fontSize: `${fontSize}rem`,
      padding: `${paddingY}rem ${paddingX}rem`,
      opacity,
    };
  };

  return (
    <div className="mt-2 w-full">
      {/* 头部标题区域 */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500/70" />
          <span>兴趣画像</span>
        </span>
        {sortedInterests.length > 0 && (
          <span className="text-[10px] text-slate-400">
            {sortedInterests.length} 个兴趣标签
          </span>
        )}
      </div>

      {/* 背景卡片：轻玻璃 + 渐变 */}
      <div className="mt-2 min-h-[56px] rounded-2xl bg-gradient-to-br from-slate-50/90 via-white to-slate-100/80 px-3 py-2 shadow-inner ring-1 ring-slate-100/70 backdrop-blur-[2px]">
        {sortedInterests.length === 0 ? (
          <p className="text-[11px] text-slate-400">暂无兴趣画像</p>
        ) : (
          <div className="mt-1 flex flex-wrap gap-2">
            {sortedInterests.map((item) => (
              <button
                key={item.interest}
                type="button"
                className="
                  relative inline-flex items-center rounded-full
                  bg-gradient-to-br from-white/95 via-slate-50 to-blue-50/80
                  text-[11px] font-medium text-slate-700
                  shadow-sm ring-1 ring-white/70
                  transition-all duration-300
                  hover:-translate-y-0.5 hover:shadow-md hover:bg-white
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                "
                style={getBubbleStyle(item.relevanceScore)}
              >
                <span className="relative z-10">{item.interest}</span>
                {/* 轻高光层，增强质感 */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-white/55 to-transparent"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(InterestCloud);
