const { recommandPostByTags } = require("../lib/fileAPI");


const handleRecommand = async (req, res) => {
  console.log("Received /recommand request", req.query);

  try {
    // 同时兼容 tags / tag / tags[]
    let raw = req.query.tags ?? req.query.tag ?? req.query["tags[]"];
    let postId = req.query.postId;
    let tagList = []; 

    if (Array.isArray(raw)) {
      tagList = raw;
    } else if (typeof raw === "string") {
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
    for (let i = posts.length - 1; i >= 0; i--) {
      if (posts[i].$id === postId) {
        posts.splice(i, 1);
      }
    }
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
