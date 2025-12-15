// hooks/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import type { AuthContextType } from "../types";

const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

export default useAuth;
