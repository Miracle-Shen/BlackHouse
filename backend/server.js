process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection:', reason);
});

require('dotenv').config({ path: '../.env' });

const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const credentials = require('./middleware/credentials');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');

// Appwrite
const { Client } = require('appwrite');

// LangGraph Agent
const { callAgent } = require('./agent/agent');

// 业务相关
const { getAllUsers } = require('./lib/userAPI');

// const { logger } = require('./middleware/logEvents');
// const errorHandler = require('./middleware/errorHandler');

// 端口：统一用一个
const PORT = process.env.PORT || 3500;

/* ========== Appwrite Client ========== */
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID);

/* ========== 全局中间件 ========== */
// app.use(logger);

app.use(credentials);
app.use(cors(corsOptions));

// 解析 body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// 静态资源（如果需要）
// const path = require('path');
// app.use('/', express.static(path.join(__dirname, '/public')));

/* ========== 通用路由 ========== */
app.get('/', (req, res) => {
  res.send('Miracle Server here');
});

/* ========== LangGraph /genTag 接口 ========== */
// 新建会话
// curl -X POST -H "Content-Type: application/json" -d '{"message": "Build a team to make an iOS app, and tell me the talent gaps."}' http://localhost:3500/genTag
app.post('/genTag', async (req, res) => {
  const initialMessage = req.body.message;
  const threadId = Date.now().toString(); // 简单生成一个 threadId

  console.log('initialMessage', initialMessage);
  try {
    const response = await callAgent(client, initialMessage, threadId);
    res.json({ threadId, response });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 已有会话里继续聊天
// curl -X POST -H "Content-Type: application/json" -d '{"message": "What team members did you recommend?"}' http://localhost:3500/genTag/123456789
app.post('/genTag/:threadId', async (req, res) => {
  const { threadId } = req.params;
  const { message } = req.body;

  try {
    const response = await callAgent(client, message, threadId);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use("/chat",  require("./routes/chat"));
/* ========== 认证 & 业务路由 ========== */
// 这些也通常不需要 JWT 的放在前面
app.use('/register', require('./routes/register')); // 注册
app.use('/logout', require('./routes/logout'));     // 注销
app.use('/auth', require('./routes/auth'));         // 登录认证
app.use('/refresh', require('./routes/refresh'));   // 刷新 token

// 下面的路由统一走 JWT 保护
app.use(verifyJWT);
app.use('/user', require('./routes/user'));         // 用户相关

/* ========== 404 处理（可选） ========== */
// app.all('*', (req, res) => {
//   res.status(404);
//   if (req.accepts('html')) {
//     res.sendFile(path.join(__dirname, 'views', '404.html'));
//   } else if (req.accepts('json')) {
//     res.json({ error: '404 Not Found' });
//   } else {
//     res.type('txt').send('404 Not Found');
//   }
// });

/* ========== 自定义错误中间件（可选） ========== */
// app.use(errorHandler);

/* ========== 启动前的初始化逻辑（比如 getAllUsers） ========== */
(async () => {
  try {
    // 启动前预加载用户数据
    delete require.cache[require.resolve('./model/users.json')];
    await getAllUsers();
    console.log('Fetched all users successfully on server start.');

    // 启动服务器
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Error during server start:', error);
    process.exit(1);
  }
})();

