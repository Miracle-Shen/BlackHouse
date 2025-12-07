import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Profile from "../components/Profile"; 
import useAuth from "../hooks/useAuth";

const UserPage = () => {
  const { id } = useParams();        // 路由里的 :id
  const {auth, setAuth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const [user, setUser] = useState<any | null>(null);
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        const res = await axiosPrivate.get("/profile", {
          signal: controller.signal,
          params: { userId: id },
        });
        if (!res.data?.ok) return;

        const profileUser = res.data.user;
        const interests = res.data.interest || [];
        setInterests(interests);
        setUser(profileUser); // 不管是不是自己，先把当前要显示的用户存起来

        // if (id === currentUserId) {
        //   setAuth((prev: any) => ({
        //     ...prev,
        //     $id: profileUser.$id,
        //     userId: profileUser.userId
        //   }));
        // }
      } catch (err) {
        console.error("fetchUser error:", err);
        navigate("/login", { replace: true });
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => controller.abort();
  }, [id, axiosPrivate, navigate, setAuth]);

  if (loading) {
    // 这里可以复用你 Mine 里那个 skeleton
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white/90 px-4 py-5 shadow-sm text-center">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
          <p className="text-sm font-medium text-slate-800">
            正在加载用户信息...
          </p>
          <p className="mt-1 text-xs text-slate-400">
            请稍候片刻。
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white px-5 py-6 shadow-sm text-center">
          <p className="text-sm font-semibold text-slate-900">
            未获取到用户信息
          </p>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white hover:bg-blue-600"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <Profile users={user} interests={interests} setUsers={setUser} />
      </div>
    </div>
  );
};

export default UserPage;
