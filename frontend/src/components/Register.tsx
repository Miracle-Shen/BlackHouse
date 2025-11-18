import { useRef, useState, useEffect } from "react";
import axios from '../api/axios';

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
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
        const v1 = USER_REGEX.test(user);
        const v2 = PWD_REGEX.test(pwd);
        if (!v1 || !v2) {
            setErrMsg("Invalid Entry");
            return;
        }
        try {
            const response = await axios.post(REGISTER_URL,
                JSON.stringify({ user, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            console.log(JSON.stringify(response?.data));
            setSuccess(true);
            setUser('');
            setPwd('');
            setMatchPwd('');
        } catch (err: unknown) {
            interface ErrorResponse {
                response?: {
                    status?: number;
                };
            }
            const error = err as ErrorResponse;
            if (!error?.response) {
                setErrMsg('No Server Response');
            } else if (error.response?.status === 409) {
                setErrMsg('Username Taken');
            } else {
                setErrMsg('Registration Failed')
            }
            errRef.current?.focus();
        }
    }

    return (
        <>
            {success ? (
                <div className="p-4">
                    <div className="max-w-sm mx-auto text-center">
                        <h1 className="text-xl font-bold mb-2">Success!</h1>
                        <p>Account created successfully.</p>
                    </div>
                </div>
            ) : (
                <div className="p-4">
                    <div className="max-w-sm mx-auto">
                        {errMsg && (
                            <p ref={errRef} className="text-red-600 text-sm mb-4" aria-live="assertive">
                                {errMsg}
                            </p>
                        )}
                        <h1 className="text-xl font-bold mb-4">Register</h1>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm mb-1">
                                    Username {validName && <span className="text-green-600">✓</span>}
                                    {!validName && user && <span className="text-red-600">✗</span>}
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    ref={userRef}
                                    autoComplete="off"
                                    onChange={(e) => setUser(e.target.value)}
                                    value={user}
                                    required
                                    onFocus={() => setUserFocus(true)}
                                    onBlur={() => setUserFocus(false)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                                {userFocus && user && !validName && (
                                    <p className="text-xs text-gray-600 mt-1">
                                        4 to 24 characters. Must begin with a letter. Letters, numbers, underscores, hyphens allowed.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm mb-1">
                                    Password {validPwd && <span className="text-green-600">✓</span>}
                                    {!validPwd && pwd && <span className="text-red-600">✗</span>}
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    onChange={(e) => setPwd(e.target.value)}
                                    value={pwd}
                                    required
                                    onFocus={() => setPwdFocus(true)}
                                    onBlur={() => setPwdFocus(false)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                                {pwdFocus && !validPwd && (
                                    <p className="text-xs text-gray-600 mt-1">
                                        8 to 24 characters. Must include uppercase and lowercase letters, a number and a special character (!@#$%).
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirm_pwd" className="block text-sm mb-1">
                                    Confirm Password {validMatch && matchPwd && <span className="text-green-600">✓</span>}
                                    {!validMatch && matchPwd && <span className="text-red-600">✗</span>}
                                </label>
                                <input
                                    type="password"
                                    id="confirm_pwd"
                                    onChange={(e) => setMatchPwd(e.target.value)}
                                    value={matchPwd}
                                    required
                                    onFocus={() => setMatchFocus(true)}
                                    onBlur={() => setMatchFocus(false)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                                {matchFocus && !validMatch && (
                                    <p className="text-xs text-gray-600 mt-1">
                                        Must match the first password input field.
                                    </p>
                                )}
                            </div>

                            <button 
                                disabled={!validName || !validPwd || !validMatch}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded"
                            >
                                Sign Up
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default Register