// 引入express框架，用于创建路由
const express = require('express');
const router = express.Router(); // 创建一个路由实例

// 引入path模块，用于处理文件路径
const path = require('path');

// 定义根路由的GET请求处理
router.get(/^\/$|\/index(\.html)?/, (req, res) => {
    // 发送index.html文件作为响应
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

// 导出路由模块
module.exports = router;