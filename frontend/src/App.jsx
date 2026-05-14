import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { connectSocket, disconnectSocket } from "./sockets/socket";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";

import LoginPage           from "./pages/LoginPage";
import RegisterPage        from "./pages/RegisterPage";
import ForgotPasswordPage  from "./pages/ForgotPasswordPage";
import ResetPasswordPage   from "./pages/ResetPasswordPage";
import FeedPage            from "./pages/FeedPage";
import FavoritesPage       from "./pages/FavoritesPage";
import ProfilePage         from "./pages/ProfilePage";
import MessagesPage        from "./pages/MessagesPage";
import ChatPage            from "./pages/ChatPage";
import NotificationsPage   from "./pages/NotificationsPage";
import SearchPage          from "./pages/SearchPage";

const AUTH_PATHS = [
  "/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password",
];

function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = AUTH_PATHS.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    if (user) connectSocket(user.id);
    else disconnectSocket();
  }, [user]);

  return (
      <>
        {!isAuthPage && user && <Header />}
        <div className={isAuthPage ? "" : "app-content"}>
          <Routes>
            <Route path="/auth/login"                  element={<LoginPage />} />
            <Route path="/auth/register"               element={<RegisterPage />} />
            <Route path="/auth/forgot-password"        element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password/:token"  element={<ResetPasswordPage />} />
            <Route path="/feed"              element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
            <Route path="/favorites"         element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
            <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/messages"          element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/messages/:userId"  element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/notifications"     element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/search"            element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
            <Route path="/"  element={<Navigate to="/feed" replace />} />
            <Route path="*"  element={<Navigate to="/feed" replace />} />
          </Routes>
        </div>
      </>
  );
}

export default function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </BrowserRouter>
  );
}
