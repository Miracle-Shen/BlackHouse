const express = require('express');
const router = express.Router();
const recommandController = require('../controllers/recommandController');

router.get("/", recommandController.handleRecommand);
module.exports = router;