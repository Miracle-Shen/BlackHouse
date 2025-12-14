import { useCallback } from 'react';
import axios from '../api/axios';
import useAuth from './useAuth';

//单飞工具
let refreshPromise: Promise<string> | null = null;

function singleFlightRefresh(refreshFn: () => Promise<string>): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshFn().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
// 自定义hook，用于刷新访问令牌
//场景：当访问令牌过期时，调用此hook获取新的访问令牌
const useRefreshToken = () => {
    const { setAuth } = useAuth();

     const refresh = useCallback(async (): Promise<string> => { 
        return singleFlightRefresh(async () => {
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
            const accessToken:string = response.data.accessToken;
            setAuth(prev => {
                return {
                    ...prev,
                    accessToken
                };
            });

            return accessToken;
        });
    }, [setAuth]);  //依赖setAuth函数,确保函数引用稳定,避免闭包问题
    return refresh;
};

export default useRefreshToken;