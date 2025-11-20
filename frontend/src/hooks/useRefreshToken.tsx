import axios from '../api/axios';
import useAuth from './useAuth';

// 自定义hook，用于刷新访问令牌
//场景：当访问令牌过期时，调用此hook获取新的访问令牌
const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        const response = await axios.get('/refresh', {
            withCredentials: true // 发送请求时携带凭据（如cookie）
        });
        setAuth(prev => {
            console.log(JSON.stringify(prev));
            console.log(response.data.accessToken);
            return { ...prev, accessToken: response.data.accessToken }
        });
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;