import { useRef, useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import type { ILoginResponse } from '../types/index';
const LOGIN_URL = '/auth';

const Login = () => {
    const { setAuth } = useContext(AuthContext) as { setAuth: (auth: any) => void };

    const userRef = useRef<HTMLInputElement | null>(null);
    const errRef = useRef<HTMLParagraphElement | null>(null);
    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        userRef.current?.focus();
    }, []);

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await axios.post<ILoginResponse>(LOGIN_URL, JSON.stringify({ user, pwd }), {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });

            const { accessToken, userId, $id } = response.data;
            setAuth({ $id, userId, accessToken });
            localStorage.setItem('user', JSON.stringify({ userId, $id }));
            setUser('');
            setPwd('');
            navigate('/Mine', { replace: true });
        } catch (err: any) {
            if (!err?.response) {
                setErrMsg('无服务器响应');
            } else if (err.response?.status === 400) {
                setErrMsg('缺少用户名或密码');
            } else if (err.response?.status === 401) {
                setErrMsg('未授权');
            } else {
                setErrMsg('登录失败');
            }
            errRef.current?.focus();
        }
    };

    return (
        <section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">
                {errMsg}
            </p>

            <h1>请登录</h1>

            <form onSubmit={handleSubmit}>
                <label htmlFor="username">用户名:</label>
                <input
                    type="text"
                    id="username"
                    ref={userRef}
                    autoComplete="off"
                    onChange={(e) => setUser(e.target.value)}
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
                <span className="text-blue-500" > <Link to="/register">注册</Link></span>
            </p>
        </section>
    );
};

export default Login;