import React, { useMemo } from "react";
import { Ticket, CheckCircle2, AlertCircle, Lock, Crown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DiscountSelection = ({
  vouchers,
  subscriptions,
  selectedDiscount,
  onSelectDiscount,
  isLoading,
}) => {
  const handleSelect = (type, item) => {
    // Nếu là voucher không đủ điều kiện thì không cho chọn
    if (type === "voucher" && item.isEligible === false) return;

    if (selectedDiscount.type === type && selectedDiscount.id === item._id) {
      onSelectDiscount({ type: "none", id: "none" });
    } else {
      onSelectDiscount({ type, id: item._id });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-400">Đang tải ưu đãi...</div>
    );
  }

  const hasVouchers = vouchers && vouchers.length > 0;
  const hasSubs = subscriptions && subscriptions.length > 0;

  if (!hasVouchers && !hasSubs) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <Ticket className="w-10 h-10 mx-auto text-gray-300 mb-2" />
        <p className="text-gray-500 text-sm">
          Bạn chưa có ưu đãi nào khả dụng.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-6">
        {/* 1. DANH SÁCH GÓI ĐĂNG KÝ (Ưu tiên hiển thị) */}
        {hasSubs && (
          <div>
            <h4 className="text-sm font-bold text-amber-600 uppercase mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4" /> Gói thành viên (VIP)
            </h4>
            <div className="space-y-3">
              {subscriptions.map((sub) => {
                const isSelected =
                  selectedDiscount.type === "subscription" &&
                  selectedDiscount.id === sub._id;

                // Tính ngày hết hạn
                const expiryDate = new Date(sub.endDate);
                const daysLeft = Math.ceil(
                  (expiryDate - new Date()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={sub._id}
                    onClick={() => handleSelect("subscription", sub)}
                    className={cn(
                      "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                      isSelected
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 bg-white hover:border-amber-200"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-gray-800 text-lg">
                          {sub.pricing?.name || "Gói dịch vụ"}
                        </h5>
                        <Badge className="mt-1 bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                          Đang hoạt động
                        </Badge>

                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" /> Còn lại: {daysLeft}{" "}
                          ngày
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {isSelected ? (
                          <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-sm">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                        )}
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          Miễn phí gửi
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. DANH SÁCH VOUCHER */}
        {hasVouchers && (
          <div>
            <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
              <Ticket className="w-4 h-4" /> Voucher giảm giá ({vouchers.length}
              )
            </h4>
            <div className="space-y-3">
              {vouchers.map((voucher) => {
                const isDisabled = voucher.isEligible === false;
                const isSelected =
                  selectedDiscount.type === "voucher" &&
                  selectedDiscount.id === voucher._id;

                // Thông tin voucher
                const vInfo = voucher.voucher || {};
                const discountValueDisplay =
                  vInfo.discountType === "PERCENTAGE"
                    ? `${vInfo.discountValue}%`
                    : `${(vInfo.discountValue || 0) / 1000}k`;
                const expirationDateDisplay = vInfo.expirationDate
                  ? new Date(vInfo.expirationDate).toLocaleDateString("vi-VN")
                  : "Không rõ";
                const isUsable = voucher.status === "usable";

                return (
                  <div
                    key={voucher._id}
                    onClick={() => handleSelect("voucher", voucher)}
                    className={cn(
                      "relative p-4 rounded-xl border-2 transition-all duration-200 group",
                      isDisabled || !isUsable
                        ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-70"
                        : isSelected
                        ? "border-green-500 bg-green-50 cursor-pointer shadow-sm"
                        : "border-gray-200 bg-white hover:border-green-300 cursor-pointer hover:shadow-sm"
                    )}
                  >
                    {/* Overlay khi không dùng được */}
                    {(isDisabled || !isUsable) && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-xl">
                        <Badge
                          variant="secondary"
                          className="bg-gray-200 text-gray-600 font-bold border-gray-300 shadow-sm flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3" /> Không khả dụng
                        </Badge>
                      </div>
                    )}

                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5
                            className={cn(
                              "font-bold text-lg",
                              isDisabled || !isUsable
                                ? "text-gray-400"
                                : "text-gray-800"
                            )}
                          >
                            {vInfo.code || "MÃ LỖI"}
                          </h5>
                          {!isDisabled && isUsable && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-1.5 py-0">
                              - {discountValueDisplay}
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {vInfo.description}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                          <span>HSD: {expirationDateDisplay}</span>
                        </div>
                      </div>

                      <div className="ml-3">
                        {isSelected ? (
                          <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "h-6 w-6 rounded-full border-2",
                              isDisabled || !isUsable
                                ? "border-gray-200 bg-gray-100"
                                : "border-gray-300 group-hover:border-green-400"
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

// Icon Clock nhỏ
const ClockIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default DiscountSelection;
