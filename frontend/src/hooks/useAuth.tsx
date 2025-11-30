import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

// 定义上下文类型
export type AuthContextType = {
  auth: {
    id: string;
    userId: string;
    accessToken: string;
  } | null;
  setAuth: (auth: AuthContextType['auth']) => void;
};

const useAuth = () => {
  const context = useContext(AuthContext) as AuthContextType; // 指定类型
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;