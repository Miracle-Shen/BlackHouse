import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Mine = () => {
  const { status,auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

 useEffect(() => {
  if (status === "loading") return;

  if (!auth.accessToken) {
    navigate("/login", { state: { from: location.pathname }, replace: true });
    return;
  }

  const id = auth.$id || auth.userId;
  if (id) navigate(`/user/${id}`, { replace: true });
}, [status, auth.accessToken, auth.$id, auth.userId]);



  // 过渡态：轻量 loading
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
