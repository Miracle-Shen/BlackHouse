import { useEffect, useState } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import ShowModel from "./common/ShowModel";
const TIME_LIMIT = 3000; // 最大等待 5 秒

const PersistLogin = () => {
  const [loading, setLoading] = useState(true);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false); // 控制弹窗显示
  const refresh = useRefreshToken();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const verify = async () => {
      try {
        timeoutId = setTimeout(() => {
          console.error("%c[PersistLogin] refresh timeout", "color:red;font-weight:bold;");
          setLoading(false);
          setShowTimeoutModal(true); // 显示自定义弹窗
        }, TIME_LIMIT);

        if (!auth?.accessToken) {
          await refresh();
        }

      } catch (error) {
        console.error("[PersistLogin] refresh failed", error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    verify();
  }, []);

  // 处理跳转逻辑
  const handleNavigation = (toLogin: boolean) => {
    setShowTimeoutModal(false);
    if (toLogin) {
      navigate("/login", {
        replace: true,
        state: { from: location.pathname }
      });
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在初始化用户...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showTimeoutModal && (
        <ShowModel
          onNavigate={handleNavigation}
        />
      )}
      <Outlet />
    </>
  );
};

export default PersistLogin;