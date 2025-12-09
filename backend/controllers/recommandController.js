const { recommandPostByTags } = require("../lib/fileAPI");


const handleRecommand = async (req, res) => {
  console.log("Received /recommand request",req.query);
  try {
    const { tags } = req.query;

    // 兼容几种情况：string / array / undefined
    let tagList = [];

    if (Array.isArray(tags)) {
      // ?tags[]=a&tags[]=b
      tagList = tags;
    } else if (typeof tags === "string") {
      // ?tags=a,b 或 ?tags=a
      tagList = tags
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
      data: posts, //  res.data?.posts || res.data || []
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
