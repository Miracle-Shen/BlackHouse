import axios from 'axios';
const BASE_URL = 'http://localhost:3500';

export default axios.create({
    baseURL: BASE_URL
});

//带上accessToken的请求
export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});