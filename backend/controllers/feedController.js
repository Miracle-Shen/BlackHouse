const { getFeedPosts } = require("../lib/fileAPI");
const { fetchUsersByIds } = require("../lib/userAPI"); // 需要补一个 batch 版本

const handleFeed = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 8, 50);
  const cursor = req.query.cursor || null;

  try {
    // 1) 查 posts（只查 feed 需要的字段更好）
    const postList = await getFeedPosts({ limit, cursor });

    const posts = postList?.documents || [];
    if (posts.length === 0) {
      return res.status(200).json({ ok: true, data: { items: [], nextCursor: null } });
    }

    // 2) 收集 creatorIds（去重）
    const creatorIds = [...new Set(posts.map(p => p.creator).filter(Boolean))];

    // 3) 批量查 creators（只取摘要字段）
    //    建议返回形如：[{ id, name, avatarUrl }]
    const users = await fetchUsersByIds(creatorIds);


    // 4) 组装 Map，服务端完成 join
    const userMap = new Map(users.map(u => [u.id, u]));

    const items = posts.map(post => ({
      id: post.$id,
      title: post.title,
      caption: post.caption,
      thumbnailUrl: post.thumbnailUrl,
      imageUrl: post.imageUrl,
      imageId: post.imageId,
      tags: post.tags,
      createdAt: post.$createdAt,
      updatedAt: post.$updatedAt,
      isPublished: !!post.isPublished,
      creator: userMap.get(post.creator) || {
        id: post.creator,
        name: "Unknown",
        avatarUrl: null,
        thumbnailUrl: null,
      },
    }));

    // 5) nextCursor：通常用“这一页最后一条”的游标
    const nextCursor = posts[posts.length - 1].$id; // 注意：这需要你排序/游标策略一致（见下方关键点）

    res.status(200).json({
      ok: true,
      data: {
        items,
        nextCursor,
      },
    });
  } catch (err) {
    console.error("[GET /feed] error:", err);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

module.exports = { handleFeed };
