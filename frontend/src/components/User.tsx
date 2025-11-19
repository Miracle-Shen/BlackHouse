import { useNavigate, Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthProvider";
import  { axiosPrivate } from "../api/axios";
import useRefreshToken from "../hooks/useRefreshToken";
const User = () => {
   const[users,setUsers]=useState([]);
 
   useEffect(()=>{
      let isMounted=true;
      const controller=new AbortController(); // 取消请求的控制器
      const fetchUsers=async()=>{
         try{
            const response=await axiosPrivate.get('/users',{
               signal:controller.signal
            });
            isMounted && setUsers(response.data);
         }catch(err){
            console.error(err);
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
        {users?(
            <section>
                personal info
            </section>
        )
        :
        (<Link to="/">返回登录页</Link>
        )};
      </>
    )
}

export default User;