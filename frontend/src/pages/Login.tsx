import { useRef, useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import type { ILoginResponse } from "../types/index";

const LOGIN_URL = "/auth";

const Login = () => {
  const { setAuth } = useContext(AuthContext) as { setAuth: (auth: any) => void };

  const userRef = useRef<HTMLInputElement | null>(null);
  const errRef = useRef<HTMLParagraphElement | null>(null);

  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await axios.post<ILoginResponse>(
        LOGIN_URL,
        JSON.stringify({ user, pwd }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const { accessToken, userId, $id } = response.data;
      setAuth({ $id, userId, accessToken });
      localStorage.setItem("user", JSON.stringify({ userId, $id, accessToken }));
      setUser("");
      setPwd("");
      navigate("/Mine", { replace: true });
    } catch (err: any) {
      if (!err?.response) {
        setErrMsg("无服务器响应");
      } else if (err.response?.status === 400) {
        setErrMsg(`${err.response?.data?.message || "缺少用户名或密码"}`);
      } else if (err.response?.status === 401) {
        setErrMsg(`${err.response?.data?.message || "未授权"}`);
      } else {
        setErrMsg(`${err.response?.data?.message || "登录失败"}`);
      }
      errRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-7">
        {/* 错误提示条 */}
        <p
          ref={errRef}
          className={
            errMsg
              ? "mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600"
              : "sr-only"
          }
          aria-live="assertive"
        >
          {errMsg}
        </p>

        {/* 标题 */}
        <div className="mb-5 text-center">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            欢迎回来
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            请登录以继续使用你的账号
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="username"
              className="text-xs font-medium text-slate-600 sm:text-sm"
            >
              用户名
            </label>
            <input
              type="text"
              id="username"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUser(e.target.value)}
              value={user}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
              placeholder="请输入用户名"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs font-medium text-slate-600 sm:text-sm"
            >
              密码
            </label>
            <input
              type="password"
              id="password"
              autoComplete="off"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
              placeholder="请输入密码"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex h-10 w-full items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "登录中..." : "登录"}
          </button>
        </form>

        {/* 底部切换注册 */}
        <p className="mt-4 text-center text-xs text-slate-500 sm:text-sm">
          还没有账号？
          <Link
            to="/register"
            className="ml-1 font-medium text-blue-500 hover:underline underline-offset-4"
          >
            去注册
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
