import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import User from "../components/User";

const Mine = () => {
   const { auth, setAuth } = useAuth(); 
   const navigate = useNavigate();
   const location = useLocation();
   const [users, setUsers] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const axiosPrivate = useAxiosPrivate();
   useEffect(() => {
   const controller = new AbortController();

   const fetchUsers = async () => {
      try {
         const response = await axiosPrivate.get("/user", {
         signal: controller.signal,
         params: { userId: auth?.$id },
         });

         setUsers(response.data);
      } catch (err: any) {
         navigate("/login", {
         state: { from: location.pathname },
         replace: true,
         });
      } finally {
         if (!controller.signal.aborted) {
         setIsLoading(false);
         }
      }
   };

   fetchUsers();

   return () => controller.abort();
   }, []);



    if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white/90 px-4 py-5 shadow-sm text-center">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
          <p className="text-sm font-medium text-slate-800">
            正在验证用户身份...
          </p>
          <p className="mt-1 text-xs text-slate-400">
            请稍候片刻，如果长时间无响应可以尝试重新登录。
          </p>
        </div>
      </div>
    );
  }

  if ((users as any).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white px-5 py-6 shadow-sm text-center">
          <p className="text-sm font-semibold text-slate-900">
            未获取到用户信息
          </p>
          <p className="mt-1 text-xs text-slate-400">
            可能是登录状态已过期，请重新登录后再试。
          </p>
          <button
            onClick={() =>
              navigate("/login", {
                state: { from: location.pathname },
                replace: true,
              })
            }
            className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white hover:bg-blue-600"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <User users={users} setUsers={setUsers} setAuth={setAuth} />
      </div>
    </div>
  );
};

export default Mine;