import Login from './components/Login';
import Register from './components/Register';
import FeedPage from './pages/FeedPage';
import Layout from './components/Layout';
import { Routes, Route } from 'react-router-dom';
import PublishPage from './pages/PublishPage';
import Mine from './pages/Mine';
function App() {

  return (
    <Routes>
      {/* 登录和注册页面不使用布局 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/publish" element={<PublishPage />} />
      {/* 其他页面使用布局 */}
      <Route path="/" element={<Layout />}>
        <Route index element={<FeedPage />} />
        <Route path="mine" element={<Mine />} />
      </Route>
    </Routes>
  );
}

export default App;