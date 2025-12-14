import type React from "react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalModal } from "@/context/ModalProvider";
import useAuth from "@/hooks/useAuth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { auth, status } = useAuth();
  const { showConfirm } = useGlobalModal();
  const navigate = useNavigate();

  const openedRef = useRef(false);

  const isAuthed = !!auth.accessToken; 

  useEffect(() => {
    // 等 PersistLogin 把状态定下来
    if (status === "loading") return;

    if (!isAuthed && !openedRef.current) {
      openedRef.current = true;

      showConfirm({
        title: "请先登录",
        description: "该功能需要先登录。",
        confirmText: "去登录",
        onConfirm: () => navigate("/login", { replace: true }),
        cancelText: "返回",
        onCancel: () => navigate("/", { replace: true }),
      });
    }
  }, [status, isAuthed, showConfirm, navigate]);

  if (status === "loading") return null;
  if (!isAuthed) return null;

  return <>{children}</>;
}
