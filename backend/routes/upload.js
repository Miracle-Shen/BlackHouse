const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 限制文件大小为5MB
})
const { handleUpload } = require('../controllers/uploadController');

router.post('/', upload.single('file'), handleUpload);

module.exports = router;