import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import useRefreshToken from "@/hooks/useRefreshToken";

export default function PersistLogin() {
  const { auth, persist, status, setStatus, logout } = useAuth();
  const refresh = useRefreshToken();

  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    async function bootstrap() {
      setStatus("loading");

      if (!persist) {
        setStatus("guest");
        return;
      }

      if (auth.accessToken) {
        setStatus("authed");
        return;
      }

      try {
        await refresh();
        setStatus("authed");
      } catch (e) {
        logout(); // 你内部会 setStatus('guest')
      }
    }

    bootstrap();
  }, [persist, auth.accessToken, refresh, setStatus, logout]);

  //  至少给个 fallback，避免白屏
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        正在恢复登录态…
      </div>
    );
  }

  // ✅ 子路由渲染位置
  return <Outlet />;
}
