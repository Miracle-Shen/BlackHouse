const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feedController");

// POST /chat
// body: { tag: string, postId?: string, stream?: boolean }
router.get("/", feedController.handleFeed);

module.exports = router;