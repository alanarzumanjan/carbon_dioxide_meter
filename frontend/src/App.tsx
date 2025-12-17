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
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { ThemeProvider } from "./components/layout/ThemeContext";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const raw = localStorage.getItem("user");
  const isAuth = !!raw;

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicLayout({ children }: { children: JSX.Element }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function AppLayoutWrapper() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <AppLayout />
      </div>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public pages with Header/Footer */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
          <Route path="/contacts" element={<PublicLayout><ContactsPage /></PublicLayout>} />

          {/* Authenticated pages with Header/Footer + Sidebar */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayoutWrapper />
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
          <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}