// frontend/src/components/user/VoucherCard.jsx
import React from "react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Clock, Ticket, CheckCircle, XCircle } from "lucide-react";
import { vi } from "date-fns/locale";

// --- Hàm Helper ---
const getStatusClasses = (status) => {
  switch (status) {
    case "usable":
    case "available":
      return {
        text: "SẴN DÙNG",
        color: "bg-emerald-500",
        accent: "text-emerald-700",
      };
    case "used":
      return { text: "ĐÃ DÙNG", color: "bg-gray-400", accent: "text-gray-600" };
    case "expired":
      return { text: "HẾT HẠN", color: "bg-rose-500", accent: "text-rose-700" };
    default:
      return {
        text: "KHẢ DỤNG",
        color: "bg-amber-500",
        accent: "text-amber-700",
      };
  }
};

const VoucherCard = ({ voucher, isOwned, onClick }) => {
  // Voucher data (Item là UserVoucher nếu isOwned, hoặc Voucher nếu public)
  // Voucher data gốc (voucher.voucher nếu owned, voucher nếu public)
  const data = isOwned ? voucher.voucher : voucher;
  const status = isOwned ? voucher.status : "available";

  if (!data) return null;

  const {
    text: statusText,
    color: statusColor,
    accent: statusAccent,
  } = getStatusClasses(status);
  const discountText =
    data.discountType === "PERCENTAGE"
      ? `${data.discountValue}% GIẢM`
      : `${(data.discountValue || 0).toLocaleString()} VNĐ`;

  const expirationDate = data.expirationDate
    ? new Date(data.expirationDate)
    : null;
  const isDisabled = status === "used" || status === "expired";

  return (
    <Card
      className={`
                p-5 rounded-2xl shadow-xl transition-all hover:shadow-2xl cursor-pointer 
                relative overflow-hidden border-2 
                ${
                  isDisabled
                    ? "opacity-70 bg-gray-50 border-gray-200"
                    : "bg-white border-amber-300"
                }
            `}
      onClick={() => onClick(voucher, isOwned)}
    >
      {/* Background Decorator (Gradient Angle) */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 to-white/0 rounded-2xl opacity-50"></div>

      <div className="relative z-10 flex flex-col h-full">
        {/* --- HEADER/DISCOUNT --- */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-extrabold text-amber-700">
            {discountText}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${statusColor}`}
          >
            {statusText}
          </span>
        </div>

        {/* --- CODE & DESCRIPTION --- */}
        <p className="text-lg font-semibold text-gray-800 line-clamp-1">
          {data.code || "Mã Voucher (Public)"}
        </p>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-[90%]">
          {data.description || "Ưu đãi giảm giá đặc biệt."}
        </p>

        {/* --- FOOTER DETAILS --- */}
        <div className="mt-auto pt-4 border-t border-dashed border-amber-200 space-y-1 text-sm">
          {/* Hạn dùng */}
          <div className="flex items-center text-gray-600">
            <Clock size={16} className="mr-2 text-amber-500" />
            <span className="font-semibold mr-1">Hạn dùng:</span>
            {expirationDate
              ? format(expirationDate, "dd/MM/yyyy", { locale: vi })
              : "Vô thời hạn"}
          </div>

          {/* Trạng thái sở hữu (Chỉ hiển thị khi owned) */}
          {isOwned && (
            <div className="flex items-center text-gray-600">
              <Ticket size={16} className={`mr-2 ${statusAccent}`} />
              <span className="font-semibold">Trạng thái:</span>
              <span className={`ml-1 font-bold ${statusAccent}`}>
                {status === "usable" ? "Sẵn sàng dùng" : "Đã sử dụng"}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VoucherCard;
