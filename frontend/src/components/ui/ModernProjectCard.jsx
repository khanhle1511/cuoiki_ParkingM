import React from "react";
import { cn } from "@/lib/utils";

// --- SHADCN COMPONENTS ---
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress"; // Dùng progress bar nếu cần

// --- ICONS (Từ Lucide-React) ---
import { Smartphone, Target, Clock, Users, ArrowRight } from "lucide-react";

/**
 * Thẻ dự án/nhiệm vụ hiện đại (Lấy cảm hứng từ ảnh mẫu)
 * Dùng cho mục đích tổng quan nhanh trên Dashboard.
 */
function ModernProjectCard({
  icon,
  iconBgColor,
  title,
  targetTeam,
  timeLeft,
  teamMembers, // Array of { initials, src }
  progressPercent,
}) {
  const defaultMembers = teamMembers || [
    { initials: "LP" },
    { initials: "KD" },
    { initials: "HT" },
  ];
  const displayedMembers = defaultMembers.slice(0, 3);
  const overflowCount = defaultMembers.length - 3;

  return (
    <Card className="w-full max-w-xs rounded-2xl shadow-xl transition-all hover:shadow-2xl overflow-visible p-0 bg-white">
      {/* 1. HEADER ICON (Màu Hồng) */}
      <div
        className={cn(
          "absolute -top-6 left-5 h-14 w-14 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white",
          iconBgColor || "bg-pink-500" // Mặc định màu hồng
        )}
      >
        {React.cloneElement(icon || <Smartphone />, {
          className: "h-6 w-6 text-white",
        })}
      </div>

      <CardContent className="p-6 pt-12 space-y-4">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-4">
          {title || "App Development"}
        </h2>

        {/* 2. METADATA (Mục tiêu & Thời gian) */}
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-slate-400" />
            <span className="font-medium">
              {targetTeam || "Marketing Team"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="font-medium">{timeLeft || "1 Weeks Left"}</span>
          </div>
        </div>

        {/* SEPARATOR */}
        <div className="border-t border-slate-100 pt-4"></div>

        {/* 3. FOOTER (Team & Progress) */}
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 font-medium">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider">
              Team Member
            </span>
            <div className="flex items-center -space-x-2">
              {displayedMembers.map((member, index) => (
                <Avatar
                  key={index}
                  className="h-8 w-8 border-2 border-white shadow-sm transition-transform hover:z-10 hover:scale-105"
                >
                  <AvatarImage src={member.src} alt={member.initials} />
                  <AvatarFallback className="bg-slate-200 text-xs font-semibold text-slate-700">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
              {overflowCount > 0 && (
                <div className="h-8 w-8 border-2 border-white rounded-full bg-slate-100 text-xs flex items-center justify-center font-semibold text-slate-600 shadow-sm">
                  +{overflowCount}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 text-right">
            <span className="text-xs uppercase tracking-wider block">
              Progress
            </span>
            <span className="text-2xl font-bold text-slate-900 block">
              {progressPercent || "34%"}
            </span>
            {/* Tùy chọn: Thêm Progress bar nếu bạn muốn */}
            <Progress
              value={parseInt(progressPercent)}
              className="h-1 bg-slate-200"
              indicatorClassName="bg-pink-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ModernProjectCard;
