import type React from "react";
import { useGlobalModal } from "@/context/ModalProvider";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  const { showConfirm } = useGlobalModal();
  const navigate = useNavigate();
  console.log("ProtectedRoute auth:", auth);
  if (!auth || !auth.$id) {
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
