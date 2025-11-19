import { useRef, useState, useEffect } from "react";
import axios from '../api/axios';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
// 正则表达式验证用户名和密码
const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/; // 4到24位，必须以字母开头，允许字母、数字、下划线、连字符
//const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/; // 8到24位，至少包含一个小写字母、一个大写字母、一个数字和一个特殊字符
const PWD_REGEX = /^\S{8,24}$/; // 8到24位的非空字符
const REGISTER_URL = '/register';

const Register = () => {
    const userRef = useRef<HTMLInputElement>(null);
    const errRef = useRef<HTMLParagraphElement>(null);

    const [user, setUser] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    // 设置输入框初始焦点
    useEffect(() => {
        userRef.current?.focus();
    }, [])

    useEffect(() => {
        setValidName(USER_REGEX.test(user));
    }, [user])

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd, matchPwd])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // 防止通过修改前端代码绕过验证
        const v1 = USER_REGEX.test(user);
        const v2 = PWD_REGEX.test(pwd);
        if (!v1 || !v2) {
            setErrMsg("Invalid Entry");
            return;
        }
        try {
            const response = await axios.post(REGISTER_URL,
                JSON.stringify({ user:user, pwd:pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            console.log(JSON.stringify(response?.data));
            setSuccess(true);
            //清空输入框
            setUser('');
            setPwd('');
            setMatchPwd('');
        } catch (err: unknown) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('用户名已被占用');
            } else {
                setErrMsg('注册失败')
            }
            errRef.current?.focus();
        }
    }

    return (
        <>
        {success ? 
        (<>
        <h2>注册成功！</h2>
        <Link to="/login">点击这里登录</Link>
        </>)
           :
        (<section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>

            <h1>欢迎注册</h1>
            <form onSubmit={handleSubmit}>
                {/* 属性值 username 与 <input> 的 id="username" 绑定， */}
                <label htmlFor="username">
                    用户名称:
                    <span className={validName ? "valid" : "hide"}>
                       <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span className={validName || !user ? "hide" : "invalid"}>
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </label>
                <input
                    type="text"
                    id="username"
                    ref = {userRef}
                    autoComplete="off"
                    onChange={(e) => setUser(e.target.value)}
                    value={user}
                    required
                    aria-invalid={validName ? "false" : "true"}
                    aria-describedby="uidnote"
                    onFocus={()=>setUserFocus(true)}
                    onBlur={()=>setUserFocus(false)}
                />
                <p id="uidnote" className={userFocus && user && !validName ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon="info-circle" />
                    4-24位<br />
                    必须以字母开头，允许字母、数字、下划线、连字符<br />
                </p>

                <label htmlFor="password">
                    Password:
                    <span className={validPwd ? "valid" : "hide"}>
                        <FontAwesomeIcon icon={faCheck} />        
                    </span>
                    <span className={validPwd || !pwd ? "hide" : "invalid"}>
                        <FontAwesomeIcon icon={faTimes} />
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
                    onFocus={()=>setPwdFocus(true)}
                    onBlur={()=>setPwdFocus(false)}
                />
                <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    8- 24 非空字符.<br />
                    允许字母，数字，符合等可见字符
                </p>

                <label htmlFor="confirm_pwd">
                    Confirm Password:
                    <span className={validMatch && matchPwd ? "valid" : "hide"}>    
                        <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span className={validMatch || !matchPwd ? "hide" : "invalid"}>
                        <FontAwesomeIcon icon={faTimes} />    
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
                    onFocus={()=>setMatchFocus(true)}
                    onBlur={()=>setMatchFocus(false)}
                />
                <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon="info-circle" />
                    必须和上面输入的密码一致
                </p>

                <button disabled={ !validName || !validPwd || !validMatch ? true : false } onClick={handleSubmit}>注册</button>  
            </form>

            <p>
                已有账号？<br />
                <span className="line">
                    <Link to="/login">登录</Link>
                </span>
            </p>
        </section>)}
    </>
    )
}

export default Register