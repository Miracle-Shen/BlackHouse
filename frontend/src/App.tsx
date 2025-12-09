import Layout from './components/Layout';

import FeedPage from './pages/Feed';
import { Routes, Route } from 'react-router-dom';
//lazy load EditPage
// import EditPage from './pages/Edit';
import { lazy, Suspense } from 'react';
const EditPage = lazy(() => import('./pages/Edit'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PostDetails = lazy(() => import('./pages/PostDetails'));
import Mine from './pages/Mine';

import ProtectedRoute from './components/common/ProtectedRoute';
import UserPage from './pages/User';
function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
          页面加载中…
        </div>
      }
    >
    <Routes>
      {/* 登录和注册页面不使用布局 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
          {/* 其他页面使用布局 */}
          <Route path="/" element={<Layout />}>
          <Route index element={<FeedPage />} />
          <Route path="/mine" element={<Mine />} />
          <Route path="/user/:id" element={<UserPage />} />

          </Route>
          <Route
              path="/edit/:id?/tag=?"
              element={
                <ProtectedRoute>
                  <EditPage />
                </ProtectedRoute>
              }
            />
            <Route path="/posts/:id" element={<PostDetails />} />

    </Routes>
    </Suspense>
  );
}

export default App;