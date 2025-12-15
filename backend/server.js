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
const { Client } = require('appwrite');
const { callAgent } = require('./agent/agent');
const { getAllUsers } = require('./lib/userAPI');
const PORT = process.env.PORT || 3500;

/* ========== Appwrite Client ========== */
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID);

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

/* ========== 通用路由 ========== */
app.get('/', (req, res) => {
  res.send('Miracle Server here');
});

/* ========== LangGraph /genTag 接口 ========== */
// 新建会话
// curl -X POST -H "Content-Type: application/json" -d '{"message": "this is the postID:69312d0900102939c737"}' http://localhost:3500/genTag
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
// curl -X POST -H "Content-Type: application/json" -d '{"message": "this is the postID:69312d0900102939c737"}' http://localhost:3500/genTag/123456789
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
app.use("/feed",  require("./routes/feed"));
/* ========== 认证 & 业务路由 ========== */
app.use('/register', require('./routes/register')); // 注册
app.use('/logout', require('./routes/logout'));     // 注销
app.use('/auth', require('./routes/auth'));         // 登录认证
app.use('/refresh', require('./routes/refresh'));   // 刷新 token
app.use('/recommand', require('./routes/recommand')); // 推荐内容
// 下面的路由统一走 JWT 保护
app.use(verifyJWT);
app.use('/user', require('./routes/user'));         // 用户个人信息接口，单一功能
app.use('/profile', require('./routes/profile')); // 用户资料 //合并查表

const { registerUserInterestCron } = require("./job/userInterestCron");

/* ========== 启动前的初始化逻辑（ getAllUsers ，callInterestAgent ） ========== */
(async () => {
  try {
    // 启动前预加载用户数据
    delete require.cache[require.resolve('./model/users.json')];
    await getAllUsers();

    // 启动 HTTP 服务
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // 注册定时任务
      registerUserInterestCron();
    });
  } catch (error) {
    console.error('Error during server start:', error);
    process.exit(1);
  }
})();

