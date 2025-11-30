import Login from './pages/Login';
import Register from './pages/Register';
import FeedPage from './pages/Feed';
import Layout from './components/Layout';
import { Routes, Route } from 'react-router-dom';
import EditPage from './pages/Edit';
import Mine from './pages/Mine';
import PostDetails from './pages/PostDetails';
function App() {

  return (
    <Routes>
      {/* 登录和注册页面不使用布局 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="//:id?" element={<EditPage />} />
      <Route path="/posts/:id" element={<PostDetails />} />
      {/* 其他页面使用布局 */}
      <Route path="/" element={<Layout />}>
        <Route index element={<FeedPage />} />
        <Route path="mine" element={<Mine />} />
      </Route>
    </Routes>
  );
}

export default App;