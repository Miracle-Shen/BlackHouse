import { useRef, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import axios from '../api/axios';
const LOGIN_URL = '/auth';

export const Login = () => {
    const { setAuth } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const userRef = useRef(); // Reference to the username input field
    const errRef = useRef(); // Reference to the error message paragraph

    const [user, setUser] = useState(''); // State for storing the username
    const [pwd, setPwd] = useState(''); // State for storing the password
    const [errMsg, setErrMsg] = useState(''); // State for storing error messages

    useEffect(() => {
        userRef.current.focus(); // Automatically focus on the username input field when the component loads
    }, [])

    useEffect(() => {
        setErrMsg(''); // Clear error messages when username or password changes
    }, [user, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior

        try {
            const response = await axios.post(LOGIN_URL,
                JSON.stringify({ user, pwd }), // Send username and password as JSON
                {
                    headers: { 'Content-Type': 'application/json' }, // Set content type to JSON
                    withCredentials: true // Include credentials (e.g., cookies) in the request
                }
            );
            console.log(JSON.stringify(response?.data)); // Log the response data for debugging
            const accessToken = response?.data?.accessToken; // Extract the access token from the response
            const roles = response?.data?.roles; // Extract user roles from the response
            setAuth({ user, pwd, roles, accessToken }); // Update the authentication context
            setUser(''); // Clear the username field
            setPwd(''); // Clear the password field
            navigate(from, { replace: true }); // Navigate to the previous page or home
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response'); // Handle no server response
            } else if (err.response?.status === 400) {
                setErrMsg('Missing Username or Password'); // Handle missing credentials
            } else if (err.response?.status === 401) {
                setErrMsg('Unauthorized'); // Handle unauthorized access
            } else {
                setErrMsg('Login Failed'); // Handle other login failures
            }
            errRef.current.focus(); // Focus on the error message for accessibility
        }
    }

    return (

        <section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h1>Sign In</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    ref={userRef}
                    autoComplete="off"
                    onChange={(e) => setUser(e.target.value)}
                    value={user}
                    required
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    onChange={(e) => setPwd(e.target.value)}
                    value={pwd}
                    required
                />
                <button>Sign In</button>
            </form>
            <p>
                Need an Account?<br />
                <span className="line">
                    <Link to="/register">Sign Up</Link>
                </span>
            </p>
        </section>

    )
}

