import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

type AuthContextType = {
  auth: {
    id?: string;
    userId?: string;
    accessToken?: string;
    [key: string]: any;
  };
  setAuth: (auth: any) => void;
};  
const useAuth = () => {
  const context = useContext(AuthContext);
  //useDebugValue(context.auth as AuthContextType, auth => auth?.user ? "Logged In" : "Logged Out");
//   console.log("useAuth context:", context.auth);
  return context;
};

export default useAuth;