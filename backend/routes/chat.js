const express = require("express");
const router = express.Router();
const chatHandlerStream = require("../agent/chat");

// POST /chat
// body: { tag: string, postId?: string, stream?: boolean }
router.get("/", chatHandlerStream.chatHandlerStream);

module.exports = router;