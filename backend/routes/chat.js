const express = require("express");
const router = express.Router();
const chatHandler = require("../agent/chat");

// POST /chat
// body: { tag: string, postId?: string, stream?: boolean }
router.post("/", chatHandler);

module.exports = router;