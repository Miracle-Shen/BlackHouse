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
      console.log("%c[Mine render]", "color:orange;font-weight:bold;");

      let isIgnore = false;
      const controller = new AbortController(); 
      const fetchUsers = async () => {
         try {
            const response = await axiosPrivate.get('/user', {
               signal: controller.signal,
               params: {
                  userId: auth?.$id
               }
            });
            if (!isIgnore) {
               setUsers(response.data);
               setIsLoading(false);
          } 
         } catch (err: unknown) {
            console.error("Error fetching users:", err);
            if (err) {  // 如果请求失败（比如token过期），也导航到登录页
               //const error = err as { response?: { status?: number } };
               navigate("/login", { state: { from: location.pathname }, replace: true });
               // if (error.response?.status === 401 || error.response?.status === 403) {
               //    navigate("/login", { state: { from: location.pathname }, replace: true });
               // }
               // else if(error.response?.status === 500){
               //     console.error("网络不好，请稍后！");
               //      navigate("/login", { state: { from: location.pathname }, replace: true });
               // }
            }
         }finally {
            setIsLoading(false);
         }
      };
      // console.log("Mine.fetchUser start", new Error().stack.split("\n").slice(1,5));
      fetchUsers();
      return ()=>{
         isIgnore = true;
      }
   },  []);



   if (isLoading) {
    return <div>正在验证用户身份...</div>;
  }

  if (users.length === 0) {
    return (
      <div>
        未获取到用户信息
        <button onClick={() => navigate("/login", { state: { from: location.pathname }, replace: true })}>
          前往登录
        </button>
      </div>
    );
  }

return <User users={users} setUsers={setUsers} setAuth={setAuth} />;

}

export default Mine;