import { useNavigate, useLocation, Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthProvider";
import  { axiosPrivate } from "../api/axios";
import useRefreshToken from "../hooks/useRefreshToken";
const User = () => {
   const[users,setUsers]=useState([]);
    const navigate=useNavigate();
    const location=useLocation();
    const {setAuth}=useContext(AuthContext);
    const logout = async () => {
        try {
            // 调用后端退出登录接口
            await axiosPrivate.post('/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setAuth({});
            navigate('/login', { replace: true });  // 确保退出后跳转到登录页
        }
    };
   useEffect(()=>{
      let isMounted=true;
      const controller=new AbortController(); // 取消请求的控制器
      const fetchUsers=async()=>{
         try{
            const response=await axiosPrivate.get('/user',{
               signal:controller.signal
            });
            console.log("try to fetch user info", response.data);
            isMounted && setUsers(response.data);
         }catch(err){
            console.error(err);
            //navigate('/login',{state:{from:location},replace:true});
         }
        };
        fetchUsers();
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);
    return (
      <>
        <h1>用户信息页面</h1>
        {users ? (
            <>
            <section>
                personal info
                <a>
                    您好！{users.userName}
                </a>
                <div>
                    您的兴趣tags：{users.interestTags}
                </div>
            </section>
            <div>
                <button onClick={logout}>退出登录</button>
            </div>
            </>
        )
        :
        (<Link to="/">返回登录页</Link>
        )}
      </>
    )
}

export default User;