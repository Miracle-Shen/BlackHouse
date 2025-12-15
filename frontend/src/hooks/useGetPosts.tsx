import { useCallback, useEffect, useRef, useState } from "react";
import axios from "@/api/axios";

type FeedPage = {
  items: any[];
  nextCursor?: string;
};

type FetchFeedParams = {
  cursor?: string;
  signal?: AbortSignal;
};

export async function fetchFeed({
  cursor,
  signal,
}: FetchFeedParams) {
  const res = await axios.get("/feed", {
    params: {
      limit: 8,
      ...(cursor ? { cursor } : {}),
    },
    signal,
  });

  return res.data;
}

export function useGetPostsLite() {
  const [pages, setPages] = useState<FeedPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const nextCursorRef = useRef<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const hasNextPage = Boolean(nextCursorRef.current);

  // ======================
  // 首次加载
  // ======================
  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);

    fetchFeed({ signal: controller.signal })
      .then((data) => {
        setPages([{ items: data.data.items, nextCursor: data.data.nextCursor }]);
        nextCursorRef.current = data.data.nextCursor;
      })
      .catch((err) => {
        if (err.name !== "CanceledError") {
          setError(err);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  // ======================
  // 加载更多
  // ======================
  const fetchNextPage = useCallback(async () => {
    if (!nextCursorRef.current || isFetchingNextPage) return;

    setIsFetchingNextPage(true);

    try {
      const data = await fetchFeed({
        cursor: nextCursorRef.current,
      });

      setPages((prev) => [
        ...prev,
        { items: data.data.items, nextCursor: data.data.nextCursor },
      ]);

      nextCursorRef.current = data.data.nextCursor;
    } catch (err) {
      setError(err);
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [isFetchingNextPage]);

  // ======================
  // 手动刷新（Pull to Refresh）
  // ======================
  const refetch = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchFeed({ signal: controller.signal });
      setPages([{ items: data.data.items, nextCursor: data.data.nextCursor }]);
      nextCursorRef.current = data.data.nextCursor;
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // react-query 风格 API
    data: pages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  };
}
