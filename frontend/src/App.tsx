import Login from './components/Login';
import Register from './components/Register';
import FeedPage from './pages/FeedPage';
import Layout from './components/Layout-simple';
import { Routes, Route } from 'react-router-dom';
import PostEditor from './components/publish';
import Mine from './pages/Mine';
function App() {

  return (
    <Routes>
      {/* 登录和注册页面不使用布局 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/publish" element={<PostEditor />} />
      {/* 其他页面使用布局 */}
      <Route path="/" element={<Layout />}>
        <Route index element={<FeedPage />} />
        <Route path="mine" element={<Mine />} />
      </Route>
    </Routes>
  );
}

export default App;