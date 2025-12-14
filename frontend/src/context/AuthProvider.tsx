import React, { createContext, useEffect, useMemo, useState } from "react";
import type { AuthState, AuthContextType, AuthStatus } from "../types";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PERSIST_KEY = "persist_login";
const USER_KEY = "user_cache";

function readUserCache(): Pick<AuthState, "$id" | "userId"> | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      $id: typeof parsed.$id === "string" ? parsed.$id : undefined,
      userId: typeof parsed.userId === "string" ? parsed.userId : undefined,
    };
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // ✅ 启动时从 localStorage 只恢复 id（不恢复 token）
  const cached = readUserCache();

  const [auth, setAuth] = useState<AuthState>({
    accessToken: null,
    $id: cached?.$id,
    userId: cached?.userId,
  });

  const [status, setStatus] = useState<AuthStatus>("loading");

  const [persist, setPersist] = useState<boolean>(() => {
    return localStorage.getItem(PERSIST_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(PERSIST_KEY, String(persist));
  }, [persist]);

  // auth 的 id 变化时，同步到 localStorage（只存 id，不存 token）
  useEffect(() => {
    const payload = { $id: auth.$id, userId: auth.userId };
    // 两者都没就清掉
    if (!payload.$id && !payload.userId) {
      localStorage.removeItem(USER_KEY);
    } else {
      localStorage.setItem(USER_KEY, JSON.stringify(payload));
    }
  }, [auth.$id, auth.userId]);

  const logout = () => {
    setAuth({ accessToken: null });
    setStatus("guest");
    localStorage.removeItem(USER_KEY); // 清理缓存 id
    localStorage.setItem(PERSIST_KEY, "false"); // 可选：登出就取消 persist
    setPersist(false);
  };

  const value = useMemo(
    () => ({ auth, setAuth, status, setStatus, persist, setPersist, logout }),
    [auth, status, persist]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
