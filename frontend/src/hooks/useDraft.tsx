// src/hooks/useAutosaveDraft.ts
import { useEffect, useMemo, useState } from "react";
import axios from "@/api/axios";
import type { INewPost } from "@/types";

interface UseAutosaveDraftOptions {
  creatorId: string;
  post?: INewPost | null; // 服务器返回的原始数据
  id?: string;            // 编辑时的 postId
  tag?: string;           // 话题，用来区分“新建草稿”
  intervalMs?: number;    // 自动保存间隔，默认 30s
}

interface UseAutosaveDraftResult {
  draft: INewPost | null;
  onFormChange: (values: Partial<INewPost>) => void;
  onSubmitSuccess: () => void;
  isOnline: boolean;
  isDirty: boolean;
  fromDraft: boolean;   // 是否是从草稿恢复出来的
}

const loadLocalDraft = (key: string): INewPost | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as INewPost;
  } catch (e) {
    console.error("[Draft] load error", e);
    return null;
  }
};

const saveLocalDraft = (key: string, draft: INewPost) => {
  try {
    localStorage.setItem(key, JSON.stringify(draft));
  } catch (e) {
    console.error("[Draft] save error", e);
  }
};

const clearLocalDraft = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error("[Draft] clear error", e);
  }
};

export function useAutosaveDraft(
  options: UseAutosaveDraftOptions
): UseAutosaveDraftResult {
  const { creatorId, post, id, tag, intervalMs = 30000 } = options;

  // 为每个用户 + post / tag 生成唯一 key
  const draftKey = useMemo(() => {
    if (!creatorId) return "";
    if (id) return `draft_post_${creatorId}_${id}`;
    return `draft_new_${creatorId}_${tag || "default"}`;
  }, [creatorId, id, tag]);

  const [draft, setDraft] = useState<INewPost | null>(post ?? null);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingSync, setPendingSync] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [fromDraft, setFromDraft] = useState(false);

  // ===== 初始化时，优先从本地草稿恢复 =====
  useEffect(() => {
    if (!creatorId || !draftKey) return;

    const localDraft = loadLocalDraft(draftKey);

    if (localDraft) {
      setDraft(localDraft);
      setFromDraft(true);
    } else if (post) {
      setDraft(post);
      setFromDraft(false);
    }
    // 只在 post / key 变化时触发一次，不要依赖 draft
  }, [creatorId, draftKey, post?.$id]);

  // ===== 保存到云端草稿的函数 =====
  const saveDraftToServer = async (data: INewPost) => {
    try {
      await axios.post("/drafts/save", {
        key: draftKey,
        draft: data,
      });
      setPendingSync(false);
    } catch (e) {
      console.error("[Draft] save to server error", e);
      setPendingSync(true);
    }
  };

  // ===== 定时自动保存（本地 + 云端）===== 
  useEffect(() => {
    if (!draft || !draftKey) return;

    const timer = window.setInterval(() => {
      if (!isDirty) return;

      // 1. 本地保存
      saveLocalDraft(draftKey, draft);

      // 2. 在线时同步云端
      if (navigator.onLine) {
        saveDraftToServer(draft);
      } else {
        setPendingSync(true);
      }

      setIsDirty(false);
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [draft, isDirty, draftKey, intervalMs]);

  // ===== 监听网络变化：上线后自动同步 =====
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (pendingSync && draft) {
        saveDraftToServer(draft);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [draft, pendingSync]);

  // ===== 外部传进来的表单变化回调 =====
  const onFormChange = (values: Partial<INewPost>) => {
    setDraft(prev => {
      const next: INewPost = {
        ...(prev || ({} as INewPost)),
        ...values,
      };
      return next;
    });
    setIsDirty(true);
  };

  // ===== 表单提交成功后，清理草稿 =====
  const onSubmitSuccess = () => {
    if (!draftKey) return;
    clearLocalDraft(draftKey);
    setPendingSync(false);
    setIsDirty(false);
    setFromDraft(false);
  };

  return {
    draft,
    onFormChange,
    onSubmitSuccess,
    isOnline,
    isDirty,
    fromDraft,
  };
}
