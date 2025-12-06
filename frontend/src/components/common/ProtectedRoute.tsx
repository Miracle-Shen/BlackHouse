import type React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem("user"); // 举例：用 token 判断是否已登录

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
