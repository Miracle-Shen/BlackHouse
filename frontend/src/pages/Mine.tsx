import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import User from "../components/User";

const Mine = () => {
   const { auth } = useAuth();
   const navigate = useNavigate();
   const location = useLocation();
   const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const axiosPrivate = useAxiosPrivate();
   useEffect(() => {
      let isMounted = true;
      const controller = new AbortController(); // 取消请求的控制器
      
      const fetchUsers = async () => {
         try {
            const response = await axiosPrivate.get('/user', {
               signal: controller.signal
            });
            console.log("user response",response);
            if (isMounted) {
               setUsers(response.data);
               setIsLoading(false);
            }
         } catch (err: unknown) {
            console.error("err",err);
            if (err) {  // 如果请求失败（比如token过期），也导航到登录页
               console.log("detail err",err);
               const error = err as { response?: { status?: number } };
               if (error.response?.status === 401 || error.response?.status === 403) {
                  navigate("/login", { state: { from: location.pathname }, replace: true });
               }
               else if(error.response?.status === 500){
                   console.error("网络不好，请稍后！");
               }
               // else {
               //    navigate("/login", { state: { from: location.pathname }, replace: true });
               // }
            }
         }
      };
      
      fetchUsers();

      return () => {
         isMounted = false;
         controller.abort();
      };
   }, [auth]);



   return (
      <>
        {isLoading ? (
           <div>正在验证用户身份...</div>
           
        ) : (
            <>
            {users? (
                  <User/>
               ) : (
               <div>加载用户信息中...</div>
            )}
            </>
        )}
      </>
   );
}

export default Mine;