import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { ChevronRight, ChevronLeft, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

// --- SHADCN COMPONENTS ---
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- ICONS ---
import {
  DashboardIcon,
  TicketIcon,
  HistoryIcon,
  UserCircleIcon,
  MapIcon,
  UsersIcon,
  SettingsIcon,
  // Thêm CalendarIcon nếu cần dùng
} from "./LayoutIcons.jsx";

import { Logo, SidebarNavItem } from "./SidebarNavItem.jsx";

// --- 3. SIDEBAR CONTENT ---
const SidebarContent = ({ isAdmin, collapsed, onItemClick, logout }) => {
  const location = useLocation();

  // Đường dẫn Profile Admin và User
  const adminProfilePath = "/dashboard/admin/profile";
  const userProfilePath = "/dashboard/profile";
  const homePath = "/dashboard"; // Đường dẫn chung, Router sẽ xử lý chuyển hướng Admin/User

  // Hàm kiểm tra đường dẫn đang active cho Admin/User
  const isItemActive = (to) =>
    location.pathname === to ||
    (to !== homePath && location.pathname.startsWith(to));

  return (
    <div className="flex h-full flex-col gap-2 bg-yellow-50">
      <div
        className={cn(
          "flex h-20 items-center border-b border-yellow-200",
          collapsed ? "justify-center" : "px-6"
        )}
      >
        <Logo collapsed={collapsed} />
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        <nav className="grid gap-2">
          {/* --- 1. TRANG CHỦ (CHUNG) --- */}
          <SidebarNavItem
            icon={<DashboardIcon />}
            text="Trang chủ"
            to={homePath}
            collapsed={collapsed}
            onClick={onItemClick}
            isActive={
              location.pathname === homePath ||
              (location.pathname.startsWith("/dashboard/") &&
                location.pathname.split("/").length < 3)
            }
          />

          {/* --- 2. MENU DÀNH CHO ADMIN (QUẢN LÝ) --- */}
          {isAdmin && (
            <>
              {!collapsed && (
                <div className="mt-6 mb-2 px-4 text-xs font-bold text-yellow-700/60 uppercase tracking-wider">
                  Quản lý
                </div>
              )}
              <SidebarNavItem
                icon={<UsersIcon />}
                text="Quản lý tài khoản"
                to="/dashboard/users"
                collapsed={collapsed}
                onClick={onItemClick}
                isActive={location.pathname.startsWith("/dashboard/users")}
              />
              <SidebarNavItem
                icon={<SettingsIcon />}
                text="Quản lý giá & Gói"
                to="/dashboard/pricing-management"
                collapsed={collapsed}
                onClick={onItemClick}
                isActive={location.pathname.startsWith(
                  "/dashboard/pricing-management"
                )}
              />
              <SidebarNavItem
                icon={<TicketIcon />}
                text="Quản lý Voucher"
                to="/dashboard/vouchers"
                collapsed={collapsed}
                onClick={onItemClick}
                isActive={location.pathname.startsWith("/dashboard/vouchers")}
              />
              <SidebarNavItem
                icon={<MapIcon />}
                text="Quản lý Sơ đồ"
                to="/dashboard/parking-management-map"
                collapsed={collapsed}
                onClick={onItemClick}
                isActive={location.pathname.startsWith(
                  "/dashboard/parking-management-map"
                )}
              />

              <div className="my-2 border-t border-yellow-200/50"></div>
              {/* 🔥 NÚT HỒ SƠ ADMIN (Dẫn đến trang admin/profile) */}
              <SidebarNavItem
                icon={<UserCircleIcon />}
                text="Hồ sơ Admin"
                to={adminProfilePath}
                collapsed={collapsed}
                onClick={onItemClick}
                isActive={location.pathname === adminProfilePath}
              />
            </>
          )}

          {/* --- 3. MENU DÀNH CHO USER THƯỜNG --- */}
          {!isAdmin && (
            <>
              {!collapsed && (
                <div className="mt-6 mb-2 px-4 text-xs font-bold text-yellow-700/60 uppercase tracking-wider">
                  Dịch vụ
                </div>
              )}
              {/* Sơ đồ bãi xe (Dịch vụ) */}
              <SidebarNavItem
                icon={<MapIcon />}
                text="Sơ đồ bãi xe"
                to="/dashboard/parking-map"
                collapsed={collapsed}
                onClick={onItemClick}
                isActive={location.pathname === "/dashboard/parking-map"}
              />
              {/* Gói ưu đãi */}
              <SidebarNavItem
                icon={<TicketIcon />}
                text="Gói ưu đãi"
                to="/dashboard/subscriptions"
                collapsed={collapsed}
                onClick={onItemClick}
                isActive={location.pathname === "/dashboard/subscriptions"}
              />
              {/* Voucher của tôi */}
              <SidebarNavItem
                icon={<TicketIcon />}
                text="Voucher của tôi"
                to="/dashboard/my-voucher"
                collapsed={collapsed}
                onClick={onItemClick}
                isActive={location.pathname === "/dashboard/my-voucher"}
              />
              {/* Lịch sử */}
              <SidebarNavItem
                icon={<HistoryIcon />}
                text="Lịch sử"
                to="/dashboard/history"
                collapsed={collapsed}
                onClick={onItemClick}
                isActive={location.pathname === "/dashboard/history"}
              />

              <div className="my-2 border-t border-yellow-200/50"></div>
              {/* 🔥 NÚT HỒ SƠ USER (Dẫn đến trang profile thường) */}
              <SidebarNavItem
                icon={<UserCircleIcon />}
                text="Hồ sơ"
                to={userProfilePath}
                collapsed={collapsed}
                onClick={onItemClick}
                isActive={location.pathname === userProfilePath}
              />
            </>
          )}
        </nav>
      </div>

      {/* Footer Logout */}
      <div className="p-4 border-t border-yellow-200">
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-100",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
};

// --- MAIN SIDEBAR COMPONENT ---
export const Sidebar = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const { user, logout } = useAuth();

  // 🔥 LOGIC CHECK ADMIN ĐẦY ĐỦ
  const isAdmin = user?.role === "Admin" || user?.role === "Manager";

  return (
    <TooltipProvider delayDuration={0}>
      {/* === DESKTOP SIDEBAR === */}
      <aside
        className={cn(
          "hidden border-r border-yellow-200 bg-yellow-50 transition-all duration-300 ease-in-out md:flex md:flex-col z-20 relative shadow-sm",
          isSidebarCollapsed ? "w-[80px]" : "w-[280px]"
        )}
      >
        <SidebarContent
          isAdmin={isAdmin}
          logout={logout}
          collapsed={isSidebarCollapsed}
        />

        {/* NÚT THỤT RA THỤT VÀO */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-yellow-300 bg-white text-yellow-600 shadow-sm hover:bg-yellow-50 transition-all"
          title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>

      {/* === MOBILE SIDEBAR === */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[280px] p-0 bg-yellow-50 border-r-yellow-200"
        >
          <SidebarContent
            isAdmin={isAdmin}
            logout={logout}
            collapsed={false} // Mobile luôn mở rộng
            onItemClick={() => setIsMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
};

export default Sidebar;
