import Login from './pages/Login';
import Register from './pages/Register';
import FeedPage from './pages/Feed';
import Layout from './components/Layout';
import { Routes, Route } from 'react-router-dom';
import EditPage from './pages/Edit';
import Mine from './pages/Mine';
import PostDetails from './pages/PostDetails';
// import PersistLogin from './components/PersistLogin';

function App() {
  return (
    <Routes>
      {/* 登录和注册页面不使用布局 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
          {/* 其他页面使用布局 */}
          <Route path="/" element={<Layout />}>
            <Route index element={<FeedPage />} />
              {/* <Route element={<PersistLogin />}> */}
                <Route path="mine" element={<Mine />} />
              {/* </Route> */}
          </Route>
        {/* 需要登录的部分 */}
          {/* <Route element={<PersistLogin />}> */}
            <Route path="/edit/:id?" element={<EditPage />} />
            <Route path="/posts/:id" element={<PostDetails />} />
        {/* </Route> */}
    </Routes>
  );
}

export default App;