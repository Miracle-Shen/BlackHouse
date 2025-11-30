import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";
// 无感知刷新：
// 当访问令牌（accessToken）过期导致请求失败（返回 403）时，自动调用刷新令牌接口获取新令牌，并用新令牌重试原来的请求，

//axiosPrivate 根本不是稳定单例对象，每次导入都会新建一个实例
const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                // const reqId = GLOBAL_REQ_ID++;
                // const ts = Date.now();
                // config.headers["x-debug-id"] = reqId;
                // config._debugTs = ts;
                if (!config.headers['authorization']) {
                    config.headers['authorization'] = `Bearer ${auth?.accessToken}`;
                }
            //    console.log(
            //         `%c[REQ ${reqId}] ${config.method?.toUpperCase()} ${config.url} ts=${ts}`,
            //         "color:blue;font-weight:bold;"
            //     );
                return config;
            },(error) => Promise.reject(error)
        );
        const responseIntercept = axiosPrivate.interceptors.response.use(
            // 情况1：请求成功 → 直接返回响应数据
            response => {return response;
            },
            
            // 情况2：请求失败 → 进入这里处理 
            async(error) => {
                 const prevRequest = error?.config;
                // const reqId = prevRequest?.headers["x-debug-id"];
                // const ts = prevRequest?._debugTs;

                // console.log(
                //     `%c[RES ${reqId}] ERROR ${error?.response?.status} ts=${ts}`,
                //     "color:red;font-weight:bold;"
                // );
                if(error?.response?.status === 403 && !prevRequest?.sent){
                    prevRequest.sent = true;//只重试一次
                    // console.log(
                    //     `%c[RES ${reqId}] → TRY REFRESH`,
                    //     "color:orange;font-weight:bold;"
                    // );
                    const accessToken = await refresh();
                    console.log("accessToken", accessToken );
                    prevRequest.headers['authorization'] = `Bearer ${accessToken}`;
                    return axiosPrivate(prevRequest);
                }
                return Promise.reject(error);
            }
        );
         return () => {
            axiosPrivate.interceptors.response.eject(responseIntercept);
            axiosPrivate.interceptors.request.eject(requestIntercept);
        };
    }, [refresh,auth]) //浅比较，每次refresh函数变化时重新执行useEffect

    return axiosPrivate;
}

export default useAxiosPrivate;