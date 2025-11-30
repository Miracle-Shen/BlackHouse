import { useCallback } from 'react';
import axios from '../api/axios';
import useAuth from './useAuth';

// 自定义hook，用于刷新访问令牌
//场景：当访问令牌过期时，调用此hook获取新的访问令牌
const useRefreshToken = () => {
    const { setAuth } = useAuth();
    
     const refresh = useCallback(async (): Promise<string> => { 
        const ts = Date.now();
       console.log(
            `%c[REFRESH CALL] ts=${ts}`,
            "color:purple;font-weight:bold;"
        );  
        const response = await axios.get('/refresh', { withCredentials: true });
        console.log(
            `%c[REFRESH OK] new accessToken=${response.data.accessToken.substring(0,20)}...`,
            "color:green;font-weight:bold;"
        );
        setAuth(prev => {
            if (!prev) return null; // 或者决定返回一个默认结构
            return {
                ...prev,
                accessToken: response.data.accessToken
            };
        });

        return response.data.accessToken;
    }, []); 
    return refresh;
};

export default useRefreshToken;