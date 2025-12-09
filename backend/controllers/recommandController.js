const { recommandPostByTags } = require("../lib/fileAPI");


const handleRecommand = async (req, res) => {
  console.log("Received /recommand request", req.query);

  try {
    // 同时兼容 tags / tag / tags[]
    let raw = req.query.tags ?? req.query.tag ?? req.query["tags[]"];

    let tagList = [];

    if (Array.isArray(raw)) {
      // 多个：?tags[]=a&tags[]=b
      tagList = raw;
    } else if (typeof raw === "string") {
      // 单个：?tags[]=AI 或 ?tags=AI,情绪
      tagList = raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    console.log("[GET /recommand] tags:", tagList);

    if (!tagList.length) {
      return res.status(400).json({
        ok: false,
        error: "NO_TAGS",
        message: "缺少 tags 参数",
      });
    }

    const posts = await recommandPostByTags(tagList, 4);

    return res.status(200).json({
      ok: true,
      data: posts,
    });
  } catch (err) {
    console.error("[GET /recommand] error:", err);
    return res.status(500).json({
      ok: false,
      error: "INTERNAL_ERROR",
    });
  }
};


module.exports = { handleRecommand };
