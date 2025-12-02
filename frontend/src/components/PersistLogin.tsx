import { useEffect, useState } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const TIME_LIMIT = 5000; // 最大等待 5 秒

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
      {/* 自定义弹窗 */}
      {showTimeoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">会话已超时</h3>
              <p className="text-gray-500 mt-2">您的登录状态已过期，请重新登录或返回首页</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleNavigation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                返回首页
              </button>
              <button
                onClick={() => handleNavigation(true)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                去登录
              </button>
            </div>
          </div>
        </div>
      )}
      <Outlet />
    </>
  );
};

export default PersistLogin;