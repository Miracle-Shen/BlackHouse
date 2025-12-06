import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

const Layout = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");

  const handleTabClick = (tab: string, path: string) => {
    setActiveTab(tab);
    navigate(path);
  };

  return (
    <div className="min-h-screen to-slate-100 pb-16">
      <main className="mx-auto w-full max-w-3xl px-4 pt-2 pb-20">
        <Outlet />
      </main>

      {/* 底部导航 */}
      <nav className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto mb-2 w-full max-w-md px-3">
          <div className="flex items-center justify-around rounded-2xl border border-slate-200 px-2 py-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.12)] backdrop-blur-sm">
            {/* 首页 */}
            <button
              onClick={() => handleTabClick("home", "/")}
              className={`flex  text-white flex-1 flex-col items-center justify-center rounded-2xl px-3 py-1.5 text-[11px] font-medium transition ${
                activeTab === "home"
                  ? "bg-slate-900"
                  : "bg-slate-500 "
              }`}
            >
              <span className="leading-none">首页</span>
            </button>

            {/* 发布 */}
            <button
              onClick={() => handleTabClick("edit", "/edit")}
              className={`-mt-6 text-white flex h-12 w-12 items-center justify-center rounded-full border-4 border-slate-50 text-xl font-bold shadow-lg transition ${
                activeTab === "edit"
                  ? "bg-blue-500 "
                  : "bg-slate-900 "
              }`}
              aria-label="发布"
            >
              +
            </button>

            {/* 我的 */}
            <button
              onClick={() => handleTabClick("mine", "/mine")}
              className={`flex text-white flex-1 flex-col items-center justify-center rounded-2xl px-3 py-1.5 text-[11px] font-medium transition ${
                activeTab === "mine"
                  ? "bg-slate-900 "
                  : "bg-slate-500"
              }`}
            >
              <span className="leading-none">我的</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
