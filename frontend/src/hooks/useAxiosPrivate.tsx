import axios, { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

// 无感知刷新：
// 当访问令牌（accessToken）过期导致请求失败（返回 403）时，自动调用刷新令牌接口获取新令牌，并用新令牌重试原来的请求，
const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                if (!config.headers['authorization']) {
                    config.headers['authorization'] = `Bearer ${auth?.accessToken}`;
                }
                return config;
            }
        );
        const responseIntercept = axiosPrivate.interceptors.response.use(
            // 情况1：请求成功 → 直接返回响应数据
            response => response,
            
            // 情况2：请求失败 → 进入这里处理 
            async(error) => {
                const prevRequest = error?.config;
                if(error?.response?.status === 403 && !prevRequest?.sent){
                    prevRequest.sent = true;//只重试一次
                    const refreshToken = await refresh();
                    prevRequest.headers['authorization'] = `Bearer ${refreshToken}`;
                    return axiosPrivate(prevRequest);
                }
            }
        );
        return () => {
            axiosPrivate.interceptors.response.eject(responseIntercept);
            axiosPrivate.interceptors.request.eject(requestIntercept);
        }
    }, [auth, refresh])

    return axiosPrivate;
}

export default useAxiosPrivate;