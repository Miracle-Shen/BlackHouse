import { useEffect, useRef } from "react";
import useAuth from "@/hooks/useAuth";
import useRefreshToken from "@/hooks/useRefreshToken";

/**
 * 负责“启动时决定 auth 状态”
 * - persist=false：直接 guest
 * - persist=true：
 *    - 尝试 refresh 成功 => authed
 *    - refresh 失败 => guest
 */
export default function PersistLogin({ children }: { children: React.ReactNode }) {
  const { auth, persist, status, setStatus, logout } = useAuth();
  const refresh = useRefreshToken();

  // 防止 StrictMode / rerender 导致 bootstrap 重复触发
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    async function bootstrap() {
      setStatus("loading");      // 启动时先标记 loading

      if (!persist) {  // 不持久化：不做 refresh
        setStatus("guest");
        return;
      }

      // 内存里已经有 token（一般只会发生在热更新/局部重挂载）
      if (auth.accessToken) {
        setStatus("authed");
        return;
      }

      // persist=true 且 token=null：尝试用 cookie refresh
      try {
        await refresh();
        setStatus("authed");
      } catch (e) {
        logout(); // 内部会 setStatus('guest')
      }
    }

    bootstrap();
  }, [persist, auth.accessToken, refresh, setStatus, logout]);

  // loading 阶段：你可以返回骨架屏
  if (status === "loading") return null;

  return <>{children}</>;
}
