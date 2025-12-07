import React from "react";

type Interest = {
  interest: string;
  relevanceScore: number;
};

type InterestCloudProps = {
  interests: Interest[];
};

const InterestCloud: React.FC<InterestCloudProps> = ({ interests }) => {
  const getBubbleStyle = (score: number): React.CSSProperties => {
    const s = Math.max(0, Math.min(1, score || 0));
    const fontSize = 0.75 + s * 0.5; // 0.75rem ~ 1.25rem
    const paddingY = 0.15 + s * 0.25;
    const paddingX = 0.7 + s * 0.6;
    const bgAlpha = 0.25 + s * 0.4;

    return {
      fontSize: `${fontSize}rem`,
      padding: `${paddingY}rem ${paddingX}rem`,
      backgroundColor: `rgba(59,130,246,${bgAlpha})`,
    };
  };

  return (
    <div className="mt-2 w-full">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>兴趣画像</span>
      </div>
      <div className="mt-2 min-h-[56px] rounded-xl bg-slate-50/80 px-3 py-2">
        {interests.length === 0 ? (
          <p className="text-[11px] text-slate-400">
            暂无兴趣画像
          </p>
        ) : (
          <div className="mt-1 flex flex-wrap gap-2">
            {interests.map((item) => (
              <button
                key={item.interest}
                type="button"
                className="rounded-full text-white shadow-sm transition-transform hover:-translate-y-0.5"
                style={getBubbleStyle(item.relevanceScore)}
              >
                {item.interest}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(InterestCloud);
