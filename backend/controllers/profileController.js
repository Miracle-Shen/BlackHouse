const { fetchInterestById } = require("../lib/fileAPI");
const { fetchUser } = require("../lib/userAPI");

const handleProfile = async (req, res) => {

  const userId = req.body.userId;
  console.log("userID",userId);
  try {
    const [user, interestDoc] = await Promise.all([
      fetchUser(userId),
      fetchInterestById(userId),
    ]);

    if (!user) {
      return res.status(404).json({ ok: false, error: "USER_NOT_FOUND" });
    }

    // interestDoc 可能为 null/undefined，前端自行判断
    res.status(200).json({
      ok: true,
      data: {
        user,
        interest: interestDoc || null,
      },
    });
  } catch (err) {
    console.error("[GET /users/:id/profile] error:", err);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

module.exports = { handleProfile };