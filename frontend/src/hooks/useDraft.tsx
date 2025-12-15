// src/hooks/usePostDraft.ts
import { useCallback, useEffect, useRef,useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type * as z from "zod";
import { makePostValidation } from "@/types";
import { useGlobalModal } from "@/context/ModalProvider";

type PostFormValues = z.infer<ReturnType<typeof makePostValidation>>;

// 草稿只存这些字段，避免把 file 等大对象塞进 localStorage
type DraftShape = {
  title: string;
  caption: string;
  tags: string[];
};

/**
 * 封装自动草稿逻辑：
 * - 进入页面时：如果有草稿 -> 用全局弹窗提示是否恢复
 * - 每 30s：自动保存当前表单内容到 localStorage
 * - 提供 clearDraft 方法给提交成功后调用
 */
export function usePostDraft(
  draftKey: string | undefined,
  form: UseFormReturn<PostFormValues>,
  options:boolean
) {
  const { showConfirm } = useGlobalModal();

  // 防止重复弹窗
  const hasPromptedRef = useRef(false);
  const [autoSavedAt, setAutoSavedAt] = useState<number | null>(null);

  // 进入页面时，判断是否有草稿 -> 用全局弹窗提示是否恢复
  useEffect(() => {
    if (!draftKey) return;
    if (typeof window === "undefined") return;
    if (hasPromptedRef.current) return;

    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return; // 没有草稿，直接结束

      const draft: DraftShape = JSON.parse(raw);
      hasPromptedRef.current = true;

      if(!options){ //false 不提示
        return;
      }
      showConfirm({
        title: "发现未保存的草稿",
        description: "检测到你上次编辑时留下了一份草稿，是否恢复继续编辑？",
        confirmText: "恢复草稿",
        cancelText: "不用恢复",
        onConfirm: () => {
          const current = form.getValues();
          form.reset({
            ...current,
            title: draft.title ?? current.title,
            caption: draft.caption ?? current.caption,
            tags: draft.tags ?? current.tags,
          });
        },
        onCancel: () => {
          localStorage.removeItem(draftKey);
        },
      });
    } catch (error) {
      console.error("[usePostDraft] 恢复草稿失败", error);
    }
  }, [draftKey, form, showConfirm]);

  // 每 30s 自动保存草稿
  useEffect(() => {
    if (!draftKey) return;
    if (typeof window === "undefined") return;

    const timer = window.setInterval(() => {
      try {
        const values = form.getValues();
        const draft: DraftShape = {
          title: values.title || "",
          caption: values.caption || "",
          tags: values.tags || [],
        };

        const isEmpty =
          !draft.title &&
          !draft.caption &&
          (!draft.tags || draft.tags.length === 0);

        if (isEmpty) {
          // 全空就不保留草稿，避免积累垃圾数据
          localStorage.removeItem(draftKey);
          return;
        }

        localStorage.setItem(draftKey, JSON.stringify(draft));
        setAutoSavedAt(Date.now());
      } catch (error) {
        console.error("[usePostDraft] 自动保存草稿失败", error);
      }
    }, 30000); // 30 秒

    return () => {
      window.clearInterval(timer);
    };
  }, [draftKey, form]);

  // 提交成功后清除草稿
  const clearDraft = useCallback(() => {
    if (!draftKey) return;
    if (typeof window === "undefined") return;
    localStorage.removeItem(draftKey);
  }, [draftKey]);

  return { clearDraft, autoSavedAt };
}
