import React from "react";
import { useNavigate } from "react-router-dom";
// Đã sửa đường dẫn: Chuyển từ tuyệt đối (/src/...) sang tương đối (../../...)
import { useAuth } from "../../context/AuthContext.jsx";
import { ChevronRight, Menu, LogIn } from "lucide-react"; // Đã thêm LogIn

// --- SHADCN COMPONENTS (Giả định path này) ---
import { Button } from "@/components/ui/button.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- ICONS ---
// Đã sửa đường dẫn: Chuyển từ tuyệt đối (/src/...) sang tương đối (../../...)
import { UserCircleIcon, LogoutIcon } from "./LayoutIcons.jsx";
// Ghi chú: LayoutIcons.jsx nằm cùng thư mục common, nên chỉ cần import trực tiếp

export const AppHeader = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 bg-white/80 px-8 border-b border-slate-200 backdrop-blur-md">
      {/* Nút Menu Mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden -ml-2 text-slate-500 hover:bg-yellow-50"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-7 w-7" />
      </Button>
      {/* Breadcrumb (Tạm thời giữ Dashboard/Tổng quan) */}
      <div className="hidden md:flex items-center">
        <span className="font-bold text-slate-800 text-xl tracking-tight">
          Dashboard
        </span>
        <ChevronRight className="h-4 w-4 text-slate-300 mx-3" />
        <span className="text-slate-500 font-medium">Tổng quan</span>
      </div>
      {/* User Actions */}
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          {/* ĐÃ SỬA LỖI: Loại bỏ tất cả khoảng trắng và ký tự thừa */}
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-12 w-12 rounded-full hover:bg-yellow-50 transition-colors p-0"
            >
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback className="bg-yellow-200 text-yellow-800 font-bold text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 shadow-xl border-slate-100 p-2 rounded-xl bg-white z-50"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1 px-2 pb-2">
                <p className="text-base font-bold text-slate-800">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 font-normal uppercase tracking-wider">
                  {user?.role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem
              onClick={() => navigate("/dashboard/profile")}
              className="cursor-pointer rounded-lg hover:bg-slate-50 px-3 py-2.5"
            >
              <UserCircleIcon className="mr-3 h-5 w-5 text-slate-500" />
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 cursor-pointer rounded-lg hover:bg-red-50 px-3 py-2.5 mt-1"
            >
              <LogoutIcon className="mr-3 h-5 w-5" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
