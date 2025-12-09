const { generateContentByTag } = require("../agent/contentModel");

// POST /chat
// body: { tag: string, postId?: string, stream?: boolean }
const chatHandler = async (req, res) => {
  const { tag, stream } = req.body || {};
  
  if (!tag) {
    return res.status(400).json({
      ok: false,
      error: { code: "BAD_REQUEST", message: "tag is required." },
    });
  }

  // 简单起见，先实现非流式；后面再看流式版本
  try {
    const result = await generateContentByTag({
      tag,
      thread_id: req.headers["x-thread-id"],
    });

    if (!result.ok) {
      return res.status(500).json(result);
    }

    return res.json(result);
  } catch (e) {
    console.error("[/chat] unexpected error:", e);
    return res.status(500).json({
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Unexpected error." },
    });
  }
};

const chatHandlerStream = async (req, res) => {
  const tag = req.query.tag;
  const threadId = req.query.thread_id; // EventSource 不能带自定义 header，用 query 传

  if (!tag || typeof tag !== "string") {
    res.status(400).json({
      ok: false,
      error: { code: "BAD_REQUEST", message: "tag is required as query param." },
    });
    return;
  }

  // SSE 标准响应头
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // 有些中间件（比如 compression）会延迟发送，这里 flush 一下
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  console.log("[/chat/stream] start stream, tag =", tag, "threadId =", threadId);

  // 客户端断开时，结束流
  req.on("close", () => {
    console.log("[/chat/stream] client closed connection");
  });

  try {
    const result = await generateContentByTag({
      tag,
      thread_id: threadId,
    });

    if (!result || !result.ok || !result.data?.content) {
      const errorPayload = {
        ok: false,
        error: result?.error || {
          code: "MODEL_ERROR",
          message: "Failed to generate content.",
        },
      };
      res.write(`event: error\ndata: ${JSON.stringify(errorPayload)}\n\n`);
      return res.end();
    }

    const text = result.data.content;

    // === 模拟模型“逐段推送”：这里简单按固定长度分片， ===
    const chunkSize = 5; // 每次推 20 个字符
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.slice(i, i + chunkSize);

      // SSE 标准格式：data: xxx\n\n
      res.write(`data: ${chunk}\n\n`);

      await new Promise((resolve) => setTimeout(resolve, 40));
    }

    // 告诉前端“全部结束了”
    res.write(`event: done\ndata: done\n\n`);
    res.end();
  } catch (e) {
    console.error("[/chat/stream] unexpected error:", e);
    const errorPayload = {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Unexpected error." },
    };
    res.write(`event: error\ndata: ${JSON.stringify(errorPayload)}\n\n`);
    res.end();
  }
}

module.exports = {chatHandler, chatHandlerStream};
