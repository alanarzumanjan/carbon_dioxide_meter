import type { JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DeviceConnectPage } from "./pages/DeviceConnectPage";
import { DeviceDetailPage } from "./pages/DeviceDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ContactsPage } from "./pages/ContactsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AppLayout } from "./components/layout/AppLayout";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const raw = localStorage.getItem("user");
  const isAuth = !!raw;

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contacts" element={<ContactsPage />} />

        {/* Authenticated */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="devices/connect" element={<DeviceConnectPage />} />
          <Route path="devices/:deviceId" element={<DeviceDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
