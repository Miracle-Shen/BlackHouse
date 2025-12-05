// src/context/ModalProvider.tsx
import React, { createContext, useContext, useState} from "react";
import type { ReactNode } from "react";
type ConfirmModalOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  // 额外支持一个自定义图标节点
  icon?: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type ModalContextValue = {
  showConfirm: (options: ConfirmModalOptions) => void;
  close: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export const useGlobalModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useGlobalModal must be used within ModalProvider");
  }
  return ctx;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmModalOptions>({});

  const close = () => {
    setIsOpen(false);
  };

  const showConfirm = (opts: ConfirmModalOptions) => {
    setOptions(opts);
    setIsOpen(true);
  };

  const handleCancel = () => {
    options.onCancel?.();
    close();
  };

  const handleConfirm = () => {
    options.onConfirm?.();
    close();
  };

  return (
    <ModalContext.Provider value={{ showConfirm, close }}>
      {children}

      {/* 全局弹窗挂在最外层 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {/* 默认图标，支持被自定义覆盖 */}
                {options.icon ?? <img src="/icons/loader.svg" alt="提示" />}
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                {options.title ?? "提示"}
              </h3>
              {options.description && (
                <p className="text-gray-500 mt-2">{options.description}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {options.cancelText ?? "取消"}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {options.confirmText ?? "确定"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
