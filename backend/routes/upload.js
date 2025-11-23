const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { handleUpload } = require('../controllers/uploadController');

router.post('/', upload.single('file'), handleUpload);

module.exports = router;