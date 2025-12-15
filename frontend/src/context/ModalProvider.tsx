// src/context/ModalProvider.tsx
import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type ConfirmModalOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
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

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmModalOptions>({});

  const close = () => setIsOpen(false);

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

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-100 sm:p-6">
            {/* 图标 + 文案 */}
            <div className="mb-5 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                {options.icon ?? (
                  <img
                    src="/icons/loader.svg"
                    alt="提示"
                    className="h-7 w-7"
                  />
                )}
              </div>

              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                {options.title ?? "提示"}
              </h3>
              {options.description && (
                <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
                  {options.description}
                </p>
              )}
            </div>

            {/* 按钮区域：小屏竖排，大屏横排 */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleCancel}
                className="h-9 flex-1 rounded-full border border-slate-200 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {options.cancelText ?? "取消"}
              </button>
              <button
                onClick={handleConfirm}
                className="h-9 flex-1 rounded-full bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700"
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
