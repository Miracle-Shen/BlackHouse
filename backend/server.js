const express = require('express');
const app = express(); 

const path = require('path');

const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
// const { logger } = require('./middleware/logEvents');
// const errorHandler = require('./middleware/errorHandler');

// 设置服务器监听的端口号，默认3500
const PORT = process.env.PORT || 3500;

// 使用自定义日志记录中间件
// app.use(logger);

// 启用跨域资源共享中间件
app.use(cors(corsOptions));

// 内置中间件：解析urlencoded格式的表单数据
app.use(express.urlencoded({ extended: false }));

// 内置中间件：解析JSON格式的数据
app.use(express.json());

app.use(cookieParser());

// 提供静态文件服务
// app.use('/', express.static(path.join(__dirname, '/public')));

// 配置路由
app.use('/register', require('./routes/register')); // 注册路由

app.use('/auth', require('./routes/auth')); // 认证路由
app.use('/refresh', require('./routes/refresh')); // 刷新令牌路由   
app.use(verifyJWT); // JWT验证中间件，保护后续路由
// 处理所有未匹配的路由
// app.all('*', (req, res) => {
//     res.status(404); // 设置状态码为404
//     if (req.accepts('html')) {
//         // 如果客户端接受HTML，返回404页面
//         res.sendFile(path.join(__dirname, 'views', '404.html'));
//     } else if (req.accepts('json')) {
//         // 如果客户端接受JSON，返回JSON格式的错误信息
//         res.json({ "error": "404 Not Found" });
//     } else {
//         // 如果客户端接受纯文本，返回文本格式的错误信息
//         res.type('txt').send("404 Not Found");
//     }
// });

// 使用自定义错误处理中间件
// app.use(errorHandler);

// 启动服务器，监听指定端口
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));