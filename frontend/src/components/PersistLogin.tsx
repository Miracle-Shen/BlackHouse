import { useEffect, useState } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const TIME_LIMIT = 5000; // ⭐ 最大等待 5 秒

const PersistLogin = () => {
  const [loading, setLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const verify = async () => {
      try {
        // ⭐ 计时器：5 秒内必须完成 refresh()
        timeoutId = setTimeout(() => {
          console.error("%c[PersistLogin] refresh timeout", "color:red;font-weight:bold;");
          setLoading(false);

          // 显示弹窗，用户选择跳转或回到首页
          const userChoice = window.confirm(
            "刷新超时，是否跳转到登录页面？点击取消将返回首页。"
          );
          if (userChoice) {
            navigate("/login", {
              replace: true,
              state: { from: location.pathname }
            });
          } else {
            navigate("/");
          }
        }, TIME_LIMIT);

        if (!auth?.accessToken) {
          await refresh();
        }

      } catch (error) {
        console.error("[PersistLogin] refresh failed", error);

      } finally {
        clearTimeout(timeoutId); // ⭐ 清除计时器
        setLoading(false);
      }
    };

    verify();
  }, []);

  if (loading) return <div>正在初始化用户...</div>;

  return <Outlet />;
};

export default PersistLogin;
