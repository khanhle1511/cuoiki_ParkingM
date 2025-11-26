import React, { useState } from "react";
import { Outlet } from "react-router-dom";
// SỬA LỖI 1: Đường dẫn tương đối từ components/common/ đến context/
import { useAuth } from "../../context/AuthContext.jsx";
import { TooltipProvider } from "@/components/ui/tooltip";

// --- TÁCH COMPONENTS ---
// SỬA LỖI 2 & 3: Đảm bảo cú pháp import đúng cho các file cùng cấp
import { AppHeader } from "./AppHeader.jsx";
import  {Sidebar }from "./Sidebar.jsx";

export default function DashboardLayout() {
  const { user } = useAuth(); // Chỉ cần lấy user để kiểm tra quyền
  // const isAdmin = user?.role === "Admin"; // Đã được xử lý trong Sidebar

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        {/* === SIDEBARS (Desktop & Mobile) === */}
        <Sidebar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* === RIGHT CONTENT AREA === */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          {/* --- HEADER --- */}
          <AppHeader onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />

          {/* --- MAIN CONTENT --- */}
          <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8f9fc]">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
