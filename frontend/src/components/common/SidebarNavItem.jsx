import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- COMPONENT LOGO (Tách rời khỏi SidebarNavItem) ---
export const Logo = ({ collapsed }) => (
  <div
    className={cn(
      "flex items-center gap-2 font-bold text-xl transition-all duration-300",
      collapsed ? "justify-center" : "px-2"
    )}
  >
    {" "}
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-slate-900 shadow-sm border border-yellow-500">
      {" "}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        {" "}
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />{" "}
      </svg>{" "}
    </div>{" "}
    {!collapsed && (
      <span className="whitespace-nowrap text-slate-800 tracking-tight text-2xl">
        ParkingM{" "}
      </span>
    )}{" "}
  </div>
);

// --- COMPONENT SIDEBAR ITEM ---
export const SidebarNavItem = ({ icon, text, to, collapsed, onClick }) => {
  const Content = (
    <NavLink
      to={to}
      end
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-xl py-3 transition-all duration-200",
          collapsed ? "justify-center px-2" : "px-4",
          isActive
            ? "bg-white text-yellow-700 font-bold shadow-sm border border-yellow-200"
            : "text-slate-600 hover:bg-yellow-200/50 hover:text-yellow-800"
        )
      }
    >
      {React.cloneElement(icon, { className: "h-5 w-5 shrink-0" })}{" "}
      {!collapsed && <span className="truncate">{text}</span>}{" "}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{Content}</TooltipTrigger>{" "}
        <TooltipContent
          side="right"
          className="bg-yellow-500 text-white border-yellow-600 font-semibold"
        >
          {text}{" "}
        </TooltipContent>{" "}
      </Tooltip>
    );
  }
  return Content;
};
