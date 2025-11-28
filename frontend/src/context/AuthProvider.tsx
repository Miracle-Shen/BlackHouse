import { createContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
/*     const [auth, setAuth] = useState(() => {
        const storeAuth = localStorage.getItem('auth');
        return storeAuth ? JSON.parse(storeAuth) : {};
    });
    useEffect(() => {
        localStorage.setItem('auth', JSON.stringify(auth));
    }, [auth]);

    useEffect(() => {
        function getCookie(name:string) {
            const cookies = document.cookie;//.split(';');
            for (let cookie of cookies) {
                const [cookieName, cookieValue] = cookie.trim().split('=');
                
                if (cookieName === name) {
                return cookieValue;
                }
            }
            
            return null;
            }
        const sessionCookie = getCookie('jwt');
        console.log("Session cookie:", sessionCookie);
        if(sessionCookie) {
            setAuth(prev => ({ ...prev, accessToken: sessionCookie }));
        }
    }, [auth]); */
    const [auth, setAuth] = useState({});
    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;