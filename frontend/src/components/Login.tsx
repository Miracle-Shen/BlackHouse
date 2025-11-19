import { useRef, useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthProvider';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import axios from '../api/axios';
const LOGIN_URL = '/auth';

const Login = () => {
    const {setAuth} = useContext(AuthContext); //如果登录成功，更新全局认证状态，存在context中

    const userRef = useRef<HTMLInputElement>(null);
    const errRef = useRef<HTMLParagraphElement>(null); 
    const [user, setUser] = useState(''); 
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState(''); 
    const [success, setSuccess] = useState(false); 


    useEffect(() => {
        userRef.current.focus(); // 自动聚焦用户名输入框
    }, [])

    useEffect(() => {
        setErrMsg(''); // 用户更改了输入时，清除错误信息
    }, [user, pwd])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // 阻止默认的表单提交行为

        try {
            const response = await axios.post(LOGIN_URL,
                JSON.stringify({ user:user, pwd:pwd }), 
                {
                    headers: { 'Content-Type': 'application/json' }, 
                    withCredentials: true 
                }
            );
            console.log("Login Response: " + JSON.stringify(response?.data)); 
            const accessToken = response?.data?.accessToken; 
            const roles = response?.data?.roles;
            setAuth({ user, pwd, roles, accessToken });
            setUser(''); 
            setPwd(''); 
            setSuccess(true);
            // navigate(from, { replace: true }); 
        } catch (err) {
            if (!err?.response) {
                setErrMsg('无服务器响应');
            } else if (err.response?.status === 400) {
                setErrMsg('缺少用户名或密码'); 
            } else if (err.response?.status === 401) {
                setErrMsg('未授权'); 
            } else {
                setErrMsg('登录失败'); 
            }
            errRef.current.focus(); //for 阅读器or升级功能
        }
    }

    return (
        <>
        {success ? ( <>登录成功!!</>) : 
        (<section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>

            <h1>登录</h1>

            <form onSubmit={handleSubmit}>
                <label htmlFor="username">用户名:</label>
                <input
                    type="text"
                    id="username"
                    ref={userRef}
                    autoComplete="off"
                    onChange={(e)=>setUser(e.target.value)}
                    value={user}
                    required
                />
                <label htmlFor="password">密码:</label>
                <input
                    type="password"
                    id="password"
                    autoComplete="off"
                    onChange={(e) => setPwd(e.target.value)}
                    value={pwd}
                    required
                />
                <button>登录</button>
            </form>
            <p>
                还没有账号？<br />
                <Link to="/register">注册</Link>
            </p>
        </section>
        )}
        </>
      

    )
}

export default Login;