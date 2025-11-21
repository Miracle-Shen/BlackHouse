import { useNavigate, useLocation, Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthProvider";
import  useAxiosPrivate  from "../hooks/useAxiosPrivate";
const User = () => {
   const[users,setUsers]=useState([]);
    const navigate=useNavigate();
    const {setAuth}=useContext(AuthContext);
    const axiosPrivate = useAxiosPrivate();
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
        <h1>我的</h1>
        {users ? (
            <>
            <section>
                <div className="flex-row align-item">
                    <img 
                        src="frontend\public\vite.svg"
                        alt="用户头像"
                        className="w-15 h-15 rounded-full"
                    />
                    <div className="flex-row">
                        <h3>{users.userName}</h3>
                        <p>你的tag：{users.interestTags}</p>
                    </div>
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