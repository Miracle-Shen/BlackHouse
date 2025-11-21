import { createContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});

    useEffect(() => {
        if(auth) {
            console.log("Auth changed:", auth);
        }
        function getCookie(name) {
            const cookies = document.cookie;//.split(';');
            console.log("All cookies:", JSON.stringify(cookies));
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
    }, [auth]);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;