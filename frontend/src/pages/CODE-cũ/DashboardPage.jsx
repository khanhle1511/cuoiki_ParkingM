// import React, { useState } from "react";
// import { NavLink, Outlet, useNavigate } from "react-router-dom";
// import { useAuth } from "/src/context/AuthContext.jsx";
// import { cn } from "@/lib/utils";

// // --- SHADCN COMPONENTS ---
// import { Button } from "@/components/ui/button";
// import { Sheet, SheetContent } from "@/components/ui/sheet";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// // --- ICONS ---
// import {
//   DashboardIcon,
//   CalendarIcon,
//   TicketIcon,
//   HistoryIcon,
//   UserCircleIcon,
//   LogoutIcon,
//   MapIcon,
//   UsersIcon,
//   SettingsIcon,
// } from "/src/components/common/LayoutIcons.jsx";
// import { Menu, ChevronRight, ChevronLeft } from "lucide-react";

// // --- 1. COMPONENT LOGO ---
// const Logo = ({ collapsed }) => (
//   <div
//     className={cn(
//       "flex items-center gap-2 font-bold text-xl transition-all duration-300",
//       collapsed ? "justify-center" : "px-2"
//     )}
//   >
//     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-slate-900 shadow-sm border border-yellow-500">
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         className="h-6 w-6"
//       >
//         <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
//         <circle cx="7" cy="17" r="2" />
//         <circle cx="17" cy="17" r="2" />
//       </svg>
//     </div>
//     {!collapsed && (
//       <span className="whitespace-nowrap text-slate-800 tracking-tight text-2xl">
//         ParkingM
//       </span>
//     )}
//   </div>
// );

// // --- 2. COMPONENT SIDEBAR ITEM ---
// const SidebarItem = ({ icon, text, to, collapsed, onClick }) => {
//   const Content = (
//     <NavLink
//       to={to}
//       end
//       onClick={onClick}
//       className={({ isActive }) =>
//         cn(
//           "flex items-center gap-3 rounded-xl py-3 transition-all duration-200",
//           collapsed ? "justify-center px-2" : "px-4",
//           isActive
//             ? "bg-white text-yellow-700 font-bold shadow-sm border border-yellow-200" // Active: Nền trắng nổi bật trên nền vàng
//             : "text-slate-600 hover:bg-yellow-200/50 hover:text-yellow-800" // Hover: Vàng đậm hơn chút
//         )
//       }
//     >
//       {React.cloneElement(icon, { className: "h-5 w-5 shrink-0" })}
//       {!collapsed && <span className="truncate">{text}</span>}
//     </NavLink>
//   );

//   if (collapsed) {
//     return (
//       <Tooltip>
//         <TooltipTrigger asChild>{Content}</TooltipTrigger>
//         <TooltipContent
//           side="right"
//           className="bg-yellow-500 text-white border-yellow-600 font-semibold"
//         >
//           {text}
//         </TooltipContent>
//       </Tooltip>
//     );
//   }
//   return Content;
// };

// // --- 3. SIDEBAR CONTENT ---
// const SidebarContent = ({ isAdmin, logout, collapsed, onItemClick }) => (
//   // 🔥 Thay đổi bg-white thành bg-yellow-50 (Vàng nhạt)
//   <div className="flex h-full flex-col gap-2 bg-yellow-50">
//     <div
//       className={cn(
//         "flex h-20 items-center border-b border-yellow-200",
//         collapsed ? "justify-center" : "px-6"
//       )}
//     >
//       <Logo collapsed={collapsed} />
//     </div>

//     <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
//       <nav className="grid gap-2">
//         <SidebarItem
//           icon={<DashboardIcon />}
//           text="Trang chủ"
//           to="/dashboard"
//           collapsed={collapsed}
//           onClick={onItemClick}
//         />

//         {isAdmin && (
//           <>
//             {!collapsed && (
//               <div className="mt-6 mb-2 px-4 text-xs font-bold text-yellow-700/60 uppercase tracking-wider">
//                 Quản lý
//               </div>
//             )}
//             <SidebarItem
//               icon={<UsersIcon />}
//               text="Quản lý tài khoản"
//               to="users"
//               collapsed={collapsed}
//               onClick={onItemClick}
//             />
//             <SidebarItem
//               icon={<SettingsIcon />}
//               text="Quản lý giá & Gói"
//               to="pricing-management"
//               collapsed={collapsed}
//               onClick={onItemClick}
//             />
//             <SidebarItem
//               icon={<MapIcon />}
//               text="Quản lý Sơ đồ"
//               to="parking-management-map"
//               collapsed={collapsed}
//               onClick={onItemClick}
//             />
//           </>
//         )}

//         {!isAdmin && (
//           <>
//             {!collapsed && (
//               <div className="mt-6 mb-2 px-4 text-xs font-bold text-yellow-700/60 uppercase tracking-wider">
//                 Dịch vụ
//               </div>
//             )}
//             <SidebarItem
//               icon={<MapIcon />}
//               text="Sơ đồ bãi xe"
//               to="parking-map"
//               collapsed={collapsed}
//               onClick={onItemClick}
//             />
//             <SidebarItem
//               icon={<CalendarIcon />}
//               text="Đặt chỗ trước"
//               to="booking"
//               collapsed={collapsed}
//               onClick={onItemClick}
//             />
//           </>
//         )}

//         {!collapsed && (
//           <div className="mt-6 mb-2 px-4 text-xs font-bold text-yellow-700/60 uppercase tracking-wider">
//             Cá nhân
//           </div>
//         )}
//         <SidebarItem
//           icon={<TicketIcon />}
//           text="Vé tháng"
//           to="subscriptions"
//           collapsed={collapsed}
//           onClick={onItemClick}
//         />
//         <SidebarItem
//           icon={<HistoryIcon />}
//           text="Lịch sử"
//           to="history"
//           collapsed={collapsed}
//           onClick={onItemClick}
//         />
//         <SidebarItem
//           icon={<UserCircleIcon />}
//           text="Hồ sơ"
//           to="profile"
//           collapsed={collapsed}
//           onClick={onItemClick}
//         />
//       </nav>
//     </div>
//   </div>
// );

// // --- 4. MAIN LAYOUT ---
// export default function DashboardPage() {
//   const { user, logout } = useAuth();
//   const isAdmin = user?.role === "Admin";
//   const navigate = useNavigate();

//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   return (
//     <TooltipProvider>
//       <div className="flex min-h-screen w-full bg-slate-50">
//         {/* === A. DESKTOP SIDEBAR (Màu Vàng Nhạt) === */}
//         <aside
//           className={cn(
//             "hidden border-r border-yellow-200 bg-yellow-50 transition-all duration-300 ease-in-out md:flex md:flex-col z-20 relative shadow-sm",
//             isSidebarCollapsed ? "w-[90px]" : "w-[280px]"
//           )}
//         >
//           <SidebarContent
//             isAdmin={isAdmin}
//             logout={logout}
//             collapsed={isSidebarCollapsed}
//           />

//           {/* ⚡️ NÚT THỤT RA THỤT VÀO (TO & RÕ) */}
//           <button
//             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
//             className="absolute -right-5 top-24 z-50 flex h-10 w-10 items-center justify-center rounded-full border-2 border-yellow-400 bg-white text-yellow-600 shadow-md hover:bg-yellow-400 hover:text-white hover:scale-110 transition-all duration-200"
//             title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}
//           >
//             {isSidebarCollapsed ? (
//               <ChevronRight className="h-6 w-6 stroke-[3]" />
//             ) : (
//               <ChevronLeft className="h-6 w-6 stroke-[3]" />
//             )}
//           </button>
//         </aside>

//         {/* === B. MOBILE SIDEBAR (Vẫn dùng màu vàng cho đồng bộ) === */}
//         <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
//           <SheetContent
//             side="left"
//             className="w-[280px] p-0 bg-yellow-50 border-r-yellow-200"
//           >
//             <SidebarContent
//               isAdmin={isAdmin}
//               logout={logout}
//               collapsed={false}
//               onItemClick={() => setIsMobileMenuOpen(false)}
//             />
//           </SheetContent>
//         </Sheet>

//         {/* === C. RIGHT CONTENT AREA === */}
//         <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
//           {/* --- HEADER --- */}
//           <header className="sticky top-0 z-30 flex h-20 items-center gap-4 bg-white/80 px-8 border-b border-slate-200 backdrop-blur-md">
//             {/* Nút Menu Mobile */}
//             <Button
//               variant="ghost"
//               size="icon"
//               className="md:hidden -ml-2 text-slate-500 hover:bg-yellow-50"
//               onClick={() => setIsMobileMenuOpen(true)}
//             >
//               <Menu className="h-7 w-7" />
//             </Button>

//             {/* Breadcrumb */}
//             <div className="hidden md:flex items-center">
//               <span className="font-bold text-slate-800 text-xl tracking-tight">
//                 Dashboard
//               </span>
//               <ChevronRight className="h-4 w-4 text-slate-300 mx-3" />
//               <span className="text-slate-500 font-medium">Tổng quan</span>
//             </div>

//             {/* User Actions */}
//             <div className="ml-auto flex items-center gap-4">
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     className="relative h-12 w-12 rounded-full hover:bg-yellow-50 transition-colors"
//                   >
//                     <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
//                       <AvatarImage src={user?.avatarUrl} alt={user?.name} />
//                       <AvatarFallback className="bg-yellow-200 text-yellow-800 font-bold text-lg">
//                         {user?.name?.charAt(0).toUpperCase()}
//                       </AvatarFallback>
//                     </Avatar>
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent
//                   align="end"
//                   className="w-60 shadow-xl border-slate-100 p-2 rounded-xl bg-white z-50"
//                 >
//                   <DropdownMenuLabel>
//                     <div className="flex flex-col space-y-1 px-2 pb-2">
//                       <p className="text-base font-bold text-slate-800">
//                         {user?.name}
//                       </p>
//                       <p className="text-xs text-slate-500 font-normal uppercase tracking-wider">
//                         {user?.role}
//                       </p>
//                     </div>
//                   </DropdownMenuLabel>
//                   <DropdownMenuSeparator className="bg-slate-100" />
//                   <DropdownMenuItem
//                     onClick={() => navigate("/dashboard/profile")}
//                     className="cursor-pointer rounded-lg hover:bg-slate-50 px-3 py-2.5"
//                   >
//                     <UserCircleIcon className="mr-3 h-5 w-5 text-slate-500" />{" "}
//                     Hồ sơ cá nhân
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator className="bg-slate-100" />
//                   <DropdownMenuItem
//                     onClick={logout}
//                     className="text-red-600 cursor-pointer rounded-lg hover:bg-red-50 px-3 py-2.5 mt-1"
//                   >
//                     <LogoutIcon className="mr-3 h-5 w-5" />
//                     Đăng xuất
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </header>

//           {/* --- MAIN CONTENT --- */}
//           <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8f9fc]">
//             <div className="mx-auto max-w-7xl">
//               <Outlet />
//             </div>
//           </main>
//         </div>
//       </div>
//     </TooltipProvider>
//   );
// }
