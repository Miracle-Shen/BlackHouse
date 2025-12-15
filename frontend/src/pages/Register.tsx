import { useRef, useState, useEffect } from "react";
import axios from "../api/axios";
import type { IRegisterResponse } from "../types/index";
import { Link } from "react-router-dom";

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^\S{8,24}$/;
const REGISTER_URL = "/register";

const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 8.5 6.5 12 13 4" />
  </svg>
);

const TimesIcon = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);

const InfoIcon = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="8" cy="8" r="6" />
    <path d="M8 6.2v0.4M8 7.8V11" />
  </svg>
);

/** === 组件本体 === */

const Register = () => {
  const userRef = useRef<HTMLInputElement>(null);
  const errRef = useRef<HTMLParagraphElement>(null);

  const [user, setUser] = useState("");
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    setValidName(USER_REGEX.test(user));
  }, [user]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd, matchPwd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const v1 = USER_REGEX.test(user);
    const v2 = PWD_REGEX.test(pwd);
    if (!v1 || !v2) {
      setErrMsg("用户名或密码格式不正确");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post<IRegisterResponse>(
        REGISTER_URL,
        JSON.stringify({ user: user, pwd: pwd }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setSuccess(true);
      setUser("");
      setPwd("");
      setMatchPwd("");
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (!error?.response) {
        setErrMsg("No Server Response");
      } else if (error.response?.status === 409) {
        setErrMsg("用户名已被占用");
      } else {
        setErrMsg("注册失败");
      }
      errRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========= success 状态 =========
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 text-center">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            注册成功！
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            你的账号已经创建完成，现在可以直接登录啦。
          </p>
          <Link
            to="/login"
            className="mt-5 inline-flex h-9 w-full items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white hover:bg-blue-600"
          >
            点击这里登录
          </Link>
        </div>
      </div>
    );
  }

  // ========= 注册表单 =========
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-7">
        {/* 错误提示 */}
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
            欢迎注册
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            创建一个新账号，开始发布你的内容
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用户名 */}
          <div className="space-y-1">
            <label
              htmlFor="username"
              className="flex items-center gap-1 text-xs font-medium text-slate-600 sm:text-sm"
            >
              用户名称
              <span className={validName ? "text-green-500" : "hidden"}>
                <CheckIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </span>
              <span
                className={
                  validName || !user ? "hidden" : "text-red-500 text-[11px]"
                }
              >
                <TimesIcon className="h-3 w-3" />
              </span>
            </label>
            <input
              type="text"
              id="username"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUser(e.target.value)}
              value={user}
              required
              aria-invalid={validName ? "false" : "true"}
              aria-describedby="uidnote"
              onFocus={() => setUserFocus(true)}
              onBlur={() => setUserFocus(false)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
              placeholder="4-24 位，以字母开头"
            />
            <p
              id="uidnote"
              className={
                userFocus && user && !validName
                  ? "mt-1 flex gap-1 text-[11px] text-slate-500"
                  : "sr-only"
              }
            >
              <InfoIcon className="mt-[2px] h-3.5 w-3.5" />
              <span>
                4-24 位字符，必须以字母开头，允许字母、数字、下划线、连字符。
              </span>
            </p>
          </div>

          {/* 密码 */}
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="flex items-center gap-1 text-xs font-medium text-slate-600 sm:text-sm"
            >
              密码
              <span className={validPwd ? "text-green-500" : "hidden"}>
                <CheckIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </span>
              <span
                className={
                  validPwd || !pwd ? "hidden" : "text-red-500 text-[11px]"
                }
              >
                <TimesIcon className="h-3 w-3" />
              </span>
            </label>
            <input
              type="password"
              id="password"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
              aria-invalid={validPwd ? "false" : "true"}
              aria-describedby="pwdnote"
              onFocus={() => setPwdFocus(true)}
              onBlur={() => setPwdFocus(false)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
              placeholder="8-24 位非空字符"
            />
            <p
              id="pwdnote"
              className={
                pwdFocus && !validPwd
                  ? "mt-1 flex gap-1 text-[11px] text-slate-500"
                  : "sr-only"
              }
            >
              <InfoIcon className="mt-[2px] h-3.5 w-3.5" />
              <span>8-24 位非空字符，允许字母、数字及可见符号。</span>
            </p>
          </div>

          {/* 确认密码 */}
          <div className="space-y-1">
            <label
              htmlFor="confirm_pwd"
              className="flex items-center gap-1 text-xs font-medium text-slate-600 sm:text-sm"
            >
              确认密码
              <span
                className={
                  validMatch && matchPwd ? "text-green-500" : "hidden"
                }
              >
                <CheckIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </span>
              <span
                className={
                  validMatch || !matchPwd
                    ? "hidden"
                    : "text-red-500 text-[11px]"
                }
              >
                <TimesIcon className="h-3 w-3" />
              </span>
            </label>
            <input
              type="password"
              id="confirm_pwd"
              onChange={(e) => setMatchPwd(e.target.value)}
              value={matchPwd}
              required
              aria-invalid={validMatch ? "false" : "true"}
              aria-describedby="confirmnote"
              onFocus={() => setMatchFocus(true)}
              onBlur={() => setMatchFocus(false)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
              placeholder="再次输入密码"
            />
            <p
              id="confirmnote"
              className={
                matchFocus && !validMatch
                  ? "mt-1 flex gap-1 text-[11px] text-slate-500"
                  : "sr-only"
              }
            >
              <InfoIcon className="mt-[2px] h-3.5 w-3.5" />
              <span>必须与上面输入的密码保持一致。</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={!validName || !validPwd || !validMatch || isSubmitting}
            className="mt-2 flex h-10 w-full items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "注册中..." : "注册"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500 sm:text-sm">
          已有账号？
          <Link
            to="/login"
            className="ml-1 font-medium text-blue-500 hover:underline underline-offset-4"
          >
            去登录
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
