// context/AuthProvider.tsx
import React, { createContext, useState, useEffect } from "react";
import type { AuthData, AuthContextType } from "../types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const AUTH_STORAGE_KEY = "auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // 刷新时从 localStorage 恢复
  const [auth, setAuth] = useState<AuthData | null>(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthData;
    } catch {
      return null;
    }
  });

  // auth 变化时同步到 localStorage
  useEffect(() => {
    if (auth) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
