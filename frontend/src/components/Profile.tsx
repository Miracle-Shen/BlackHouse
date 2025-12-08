import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useGetUserPosts } from "@/lib/react-query/queries";
import GridPostList from "./common/GridPostList";
import UpdateAvatarModal from "./common/UpdateAvatarModal";
import axios from "@/api/axios";
import useAuth from "../hooks/useAuth";
import InterestCloud from "./InterestCloud";
type UserProps = {
  users: any;
  setUsers: (u: any) => void;
  interests: any[];
  isOwner: boolean;
};

const Profile = ({ users, interests,setUsers,isOwner }: UserProps) => {
  const navigate = useNavigate();
  const [isShow, setIsShow] = useState(false);
    const { setAuth } = useAuth();  

  const logout = async () => {
    try {
      await axios.post("/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setAuth(null);
      localStorage.removeItem("auth");
      navigate("/login", { replace: true });
    }
  };



  const { data: userPosts } = useGetUserPosts(users.$id);
  const posts = userPosts?.documents || [];

  if (!users) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-sm text-slate-500">
        <p>未找到用户信息</p>
        <Link
          to="/login"
          className="mt-3 rounded-full bg-blue-500 px-4 py-2 text-xs font-medium text-white hover:bg-blue-600"
        >
          返回登录页
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 sm:gap-8">
        {/* 个人信息卡片 */}
        <section className="w-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
          <div className="flex flex-col items-center gap-4">
            {/* 头像 */}
            <div className="relative">
              <img
                src={users?.avatarUrl || "./icons/profile-placeholder.svg"}
                alt="avatar"
                className="h-24 w-24 rounded-full object-cover object-top shadow-sm sm:h-28 sm:w-28"
              />
              {isOwner && (                      
                <button
                  onClick={() => setIsShow(true)}
                  className="mt-3 inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 hover:bg-slate-200"
                >
                  点击修改头像
                </button>
              )}
            </div>

             {/* 🌈 兴趣圈：异步加载 + 异步拉数据 */}
            <div>
              <InterestCloud interests={interests} />
            </div>
          </div>
        </section>

        
        {/* 我的帖子 */}
        <section className="w-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
              我的帖子
            </h3>
            {posts.length > 0 && (
              <span className="text-[11px] text-slate-400">
                共 {posts.length} 条
              </span>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-400">
              <p>你还没有发布过任何帖子</p>
              <button
                onClick={() => navigate("/edit")}
                className="mt-3 inline-flex h-8 items-center justify-center rounded-full bg-blue-500 px-4 text-xs font-medium text-white hover:bg-blue-600"
              >
                去发布一条
              </button>
            </div>
          ) : (
            <div className="w-full">
              <GridPostList posts={posts} />
            </div>
          )}
        </section>

          {isOwner && (                      
            <div className="w-full flex justify-center">
              <button
                className="inline-flex h-9 items-center justify-center rounded-full bg-red-500 px-6 text-sm font-medium text-white shadow-sm hover:bg-red-600"
                onClick={logout}
              >
                退出登录
              </button>
            </div>
          )}

        </div>

      {/* 修改头像弹窗 */}
      {isShow && (
        <UpdateAvatarModal
          users={users}
          setUsers={setUsers}
          onClose={() => setIsShow(false)}
        />
      )}
    </>
  );
};

export default Profile;
