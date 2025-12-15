import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";
import PersistLogin from "./components/common/PersistLogin";
import FeedPage from "./pages/Feed";
import { AuthProvider } from "./context/AuthProvider";

const ModalProvider = lazy(() => import("./context/ModalProvider").then(m => ({ default: m.ModalProvider })));


const EditPage = lazy(() => import("./pages/Edit"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const PostDetails = lazy(() => import("./pages/PostDetails"));
const Mine = lazy(() => import("./pages/Mine"));
const UserPage = lazy(() => import("./pages/User"));
const ProtectedRoute = lazy(() => import("./components/common/ProtectedRoute"));

const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
    页面加载中…
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      {/* 只对 ModalProvider 做懒加载，不改变你原有每个路由自己的 Suspense 行为 */}
      <Suspense fallback={null}>
        <ModalProvider>
          <Routes>
            {/* 登录/注册：不走 Layout，不走 PersistLogin */}
            <Route
              path="/login"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Login />
                </Suspense>
              }
            />
            <Route
              path="/register"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Register />
                </Suspense>
              }
            />

            {/* 公共区域：用 Layout，但不强制等 PersistLogin */}
            <Route path="/" element={<Layout />}>
              <Route index element={<FeedPage />} />
              <Route
                path="posts/:id"
                element={
                  <Suspense fallback={<PageLoading />}>
                    <PostDetails />
                  </Suspense>
                }
              />
              <Route
                path="user/:id"
                element={
                  <Suspense fallback={<PageLoading />}>
                    <UserPage />
                  </Suspense>
                }
              />
            </Route>

            {/* 需要“保持登录态 / 刷新 token”的区域 */}
            <Route element={<PersistLogin />}>
              <Route
                path="/mine"
                element={
                  <Suspense fallback={<PageLoading />}>
                    <Mine />
                  </Suspense>
                }
              />
              <Route
                path="/edit/:id?"
                element={
                  <Suspense fallback={<PageLoading />}>
                    <ProtectedRoute>
                      <EditPage />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
            </Route>
          </Routes>
        </ModalProvider>
      </Suspense>
    </AuthProvider>
  );
}
