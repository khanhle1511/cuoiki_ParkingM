import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// CONTEXT
import AuthProvider, { useAuth } from "@/context/AuthContext.jsx";
import UserProfilePage from "@/pages/user/UserProfilePage.jsx";
import AdminProfilePage from "./pages/admin/AdminProfilePage"; // File mới
// === 1. IMPORT LAYOUT CHÍNH ===
import DashboardLayout from "@/components/common/DashboardLayout.jsx";

// === 2. IMPORT CÁC TRANG AUTH ===
import LoginPage from "@/pages/auth/LoginPage.jsx";
import RegisterPage from "@/pages/auth/RegisterPage.jsx";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage.jsx";
import VerifyEmailCode from "@/pages/auth/VerifyEmailCode.jsx";
import VerifyResetCodePage from "@/pages/auth/VerifyResetCodePage.jsx";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage.jsx";

// === IMPORT WELCOME PAGE ===
import WelcomePage from "@/pages/user/WelcomePage/WelcomePage.jsx";

// === 3. IMPORT CÁC TRANG USER ===
import VehicleSelectionPage from "@/pages/user/VehicleSelectionPage.jsx";
import SubscriptionPage from "@/pages/user/SubscriptionPage.jsx";

// ⭐ ĐÃ IMPORT Ở ĐÂY (OK)
import HistoryPage from "@/pages/user/HistoryPage.jsx";

import HomeDashboardContent from "@/pages/user/HomeDashboardContent.jsx";
import MyVoucherPage from "@/pages/user/MyVoucherPage.jsx";

// === 4. IMPORT CÁC TRANG ADMIN ===
import UserManagementPage from "@/pages/admin/UserManagementPage.jsx";
import UserDetailPage from "@/pages/admin/UserDetailPage.jsx";
import UserEditPage from "@/pages/admin/UserEditPage.jsx";
import PricingManagementPage from "@/pages/admin/PricingManagementPage.jsx";
import VoucherManagementPage from "@/pages/admin/VoucherManagementPage.jsx";

// === 5. IMPORT COMPONENTS ===
import FullParkingMap from "@/components/dashboard/FullParkingMap.jsx";

function ProtectedRoute() {
  const { token, user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h2>Đang tải...</h2>
      </div>
    );
  return token && user ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h2>Đang tải quyền hạn...</h2>
      </div>
    );
  if (user?.role !== "Admin" && user?.role !== "Manager")
    return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function GuestRoute() {
  const { token, user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h2>Đang tải...</h2>
      </div>
    );
  return token && user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function MainApp() {
  return (
    <Routes>
      {/* === ROUTE CÔNG CỘNG === */}
      <Route path="/verify-email" element={<VerifyEmailCode />} />
      <Route path="/verify-reset" element={<VerifyResetCodePage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* === ROUTE KHÁCH === */}
      <Route element={<GuestRoute />}>
        <Route index element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* === ROUTE BẢO VỆ (USER + ADMIN) === */}
      <Route element={<ProtectedRoute />}>
        <Route path="/select-vehicle" element={<VehicleSelectionPage />} />

        {/* --- DASHBOARD LAYOUT --- */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<HomeDashboardContent />} />
          <Route path="profile" element={<UserProfilePage />} />
          {/* ⭐ SỬA LỖI TẠI ĐÂY: Thay <h1> bằng Component <HistoryPage /> */}
          <Route path="history" element={<HistoryPage />} />
          <Route path="admin/profile" element={<AdminProfilePage />} />

          <Route path="booking" element={<h1>Booking Page</h1>} />
          <Route path="parking-map" element={<FullParkingMap />} />
          <Route path="subscriptions" element={<SubscriptionPage />} />
          <Route path="my-voucher" element={<MyVoucherPage />} />

          {/* --- ADMIN ROUTES --- */}
          <Route element={<AdminRoute />}>
            <Route path="/dashboard/users" element={<UserManagementPage />} />
            <Route path="users/:userId" element={<UserDetailPage />} />
            <Route path="users/:userId/edit" element={<UserEditPage />} />
            <Route path="parking-management-map" element={<FullParkingMap />} />
            <Route
              path="pricing-management"
              element={<PricingManagementPage />}
            />
            <Route
              path="/dashboard/vouchers"
              element={<VoucherManagementPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* === 404 === */}
      <Route
        path="*"
        element={
          <div className="p-8 text-center">
            <h1 className="text-4xl font-bold">404</h1>
          </div>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
