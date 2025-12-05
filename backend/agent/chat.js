const { generateContentByTag } = require("../agent/contentModel");

// POST /chat
// body: { tag: string, postId?: string, stream?: boolean }
const chatHandler = async (req, res) => {
  console.log("/chat called with:");
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

module.exports = chatHandler;
