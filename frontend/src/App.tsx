import Login from './components/Login';
import Register from './components/Register';
import User from './components/User';
import { feedStream as FeedStream } from './components/Feed';
import Layout from './components/Layout-simple';
import { Routes, Route } from 'react-router-dom';

function App() {

  return (
    <Routes>
      {/* 登录和注册页面不使用布局 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* 其他页面使用布局 */}
      <Route path="/" element={<Layout />}>
        <Route index element={<FeedStream />} />
        <Route path="user" element={<User />} />
      </Route>
    </Routes>
  );
}

export default App;