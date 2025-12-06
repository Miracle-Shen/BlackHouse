import type React from "react";
import { useGlobalModal } from "@/context/ModalProvider";
import { useNavigate } from "react-router-dom";
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem("user"); // 举例：用 token 判断是否已登录
   const { showConfirm } = useGlobalModal();
    const navigate = useNavigate();
  if (!isLoggedIn) {
    showConfirm({  
        title: "请先登录",
        description: "该功能需要先登录。",
        confirmText: "去登录",
        onConfirm: () => {
          navigate("/login", { replace: true });
        },
        cancelText:"返回",
        onCancel:()=>{
          navigate("/");
        }

      });
    }
  return children;
}
