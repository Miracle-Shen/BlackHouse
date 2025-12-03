import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGetUserPosts } from "@/lib/react-query/queries";
import GridPostList from "./common/GridPostList";

import UpdateAvatarModal from "./common/UpdateAvatarModal"; // 引入修改头像弹窗组件
import axios from "@/api/axios";


type UserProps = {
  users: any;
  setUsers: (u: any) => void;   // 新增
  setAuth: (auth: any) => void;
};
const User = ({ users, setUsers, setAuth }: UserProps) => {
  const navigate = useNavigate();

  const [isShow, setIsShow] =useState(false);

  const logout = async () => {
    try {
      await axios.post("/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setAuth({});
      localStorage.removeItem("user");
      navigate("/login", { replace: true }); // 确保退出后跳转到登录页
    }
  };

  useEffect(() => {
    if (users && setAuth) {
      setAuth({ ...users });
    }
  }, [users]);

  const { data: userPosts } = useGetUserPosts(users.$id);

  return (
    <>
      {users ? (
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
          <section className="w-full">
            <div className="flex flex-col items-center gap-6">
              <div className="text-center w-full">
                <h3 className="text-xl font-bold mb-1">{users.userName}</h3>
              </div>
              <button onClick={() => setIsShow(true)} className="text-blue-500 underline">
                  <img
                    src={users?.avatarUrl || "./icons/profile-placeholder.svg"}
                    alt="image"
                    className="h-24 w-24 rounded-full object-cover object-top"
                  />
                点击修改头像
               {isShow && (
              <UpdateAvatarModal
                users={users}
                setUsers={setUsers}
                onClose={() => setIsShow(false)}
              />
            )}

              </button>
              <p className="text-base text-gray-600">兴趣tag：{users.interestTags}</p>
            </div>
          </section>
          <section className="w-full">
            <div className="flex flex-col items-center gap-4 bg-gray-50 rounded-lg p-4">
              <div className="text-center w-full">
                <h3 className="text-lg font-semibold mb-2">我的帖子</h3>
                <GridPostList posts={userPosts?.documents || []} />
              </div>
            </div>
          </section>
          <div className="w-full flex justify-center mt-4">
            <button
              className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
              onClick={logout}
            >
              退出登录
            </button>
          </div>
        </div>
      ) : (
        <Link to="/">返回登录页</Link>
      )}
    </>
  );
};

export default User;