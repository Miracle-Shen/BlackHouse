import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Mine = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // auth 还没初始化好：啥都别干，等下一轮 render
    if (auth === undefined || auth === null) return;

    // 没登录 → 去登录
    if (!auth.$id) {
      navigate("/login", {
        state: { from: location.pathname },
        replace: true,
      });
      return;
    }

    // 已登录 → 跳到 user/:id
    navigate(`/user/${auth.$id}`, { replace: true });
  }, [auth, navigate, location.pathname]);

  // 过渡态：给个轻量 loading
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white/90 px-4 py-5 shadow-sm text-center">
        <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
        <p className="text-sm font-medium text-slate-800">
          正在打开你的主页...
        </p>
        <p className="mt-1 text-xs text-slate-400">
          请稍候片刻，如果长时间无响应可以尝试重新登录。
        </p>
      </div>
    </div>
  );
};

export default Mine;
