# 📱 Mobile News App — 前后端分离资讯产品（React + Node + Appwrite）

一个专注移动端体验的资讯类 Web App，支持内容发布、编辑、浏览、推荐，以及 AI 自动标签生成、AI 内容创作等能力。项目基于 **前后端分离架构**，前端侧重用户体验，后端提供数据存储、鉴权与 AI 服务。

---

## 🌟 功能特性

### 📰 信息流（Feed）
- 未登录浏览公共推荐内容
- 登录后查看个性化推荐（基于用户兴趣 tag）
- 无限滚动加载、下拉刷新、骨架屏提升体验

### 📝 内容发布 / 编辑
- 新建/编辑短图文帖子
- 图片上传与预览
- 自动草稿保存（断网可恢复）
- 发布后异步触发 AI 自动标签生成

### 🔐 用户认证
- 登录 / 注册 / 退出登录
- JWT + Refresh Token 无感刷新
- 登录状态持久化
- 统一私有化 axios API

### 🤖 AI 模块
- 自动生成帖子标签（Agent）
- 基于 tag 的相关推荐
- 根据标签自动生成文本内容（SSE 流式输出）
- 用户兴趣画像生成

### 👤 用户中心
- 用户基本信息与头像
- 兴趣标签云（InterestCloud）
- 已发布帖子列表

---

## 🧱 技术栈

### Frontend
- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **shadcn/ui**
- Axios + 自定义 Hooks
- React Router v6

### Backend
- **Node.js + Express**
- JWT（accessToken + refreshToken）
- bcrypt
- uuid
- SSE（Server-Sent Events）

### Database（BaaS）
- **Appwrite**  
  - 用户表 user  
  - 帖子表 post  
  - 标签表 tag  
  - 用户-标签关系表 user_tag  

### AI Services
- LangGraph
- 大语言模型（豆包系列等）

---

## 📂 项目结构

```bash
├── backend/
│   ├── config/              # 配置文件（CORS / JWT）
│   ├── controllers/         # 业务控制层
│   ├── lib/                 # 工具库、Appwrite 封装、AI 服务
│   ├── middleware/          # 鉴权、CORS、日志
│   ├── routes/              # API 路由
│   └── server.ts            # 入口

└── frontend/
    ├── src/
    │   ├── api/             # axios 实例和接口封装
    │   ├── components/      # UI 组件
    │   ├── context/         # AuthProvider 等全局状态
    │   ├── hooks/           # 自定义 Hook（useAuth, useAutoDraft 等）
    │   ├── lib/             # 工具库
    │   └── pages/           # 路由页面
    ├── router.tsx
    └── main.tsx
