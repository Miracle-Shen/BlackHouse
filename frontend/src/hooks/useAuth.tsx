import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

export type AuthContextType = {
    auth: {
        id: string;
        userId: string;
        accessToken: string;
    } | null;
    setAuth: React.Dispatch<
        React.SetStateAction<{
            id: string;
            userId: string;
            accessToken: string;
        } | null>
    >;
};

const useAuth = () => {
  const context = useContext(AuthContext) as AuthContextType; // 指定类型
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;