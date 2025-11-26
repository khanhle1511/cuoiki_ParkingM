import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  TicketPercent,
  Clock,
  Car,
  MapPin,
  CheckCircle2,
  X,
  Receipt,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

// --- MOCK DATA VOUCHERS (PASTEL COLORS) ---
const AVAILABLE_VOUCHERS = [
  {
    id: "v_none",
    title: "Thanh toán thường",
    description: "Không áp dụng ưu đãi",
    discountAmount: 0,
    // Pastel Blue/Slate theme
    colorBg: "bg-slate-50",
    colorBorder: "border-slate-200",
    colorText: "text-slate-700",
    colorIconBg: "bg-slate-100 text-slate-500",
    icon: <CreditCard className="w-6 h-6" />,
  },
  {
    id: "v_monthly",
    title: "Vé Tháng (Tháng 11)",
    description: "Miễn phí gửi xe",
    discountType: "FREE",
    // Pastel Purple/Indigo theme
    colorBg: "bg-indigo-50",
    colorBorder: "border-indigo-200",
    colorText: "text-indigo-700",
    colorIconBg: "bg-indigo-100 text-indigo-500",
    icon: <TicketPercent className="w-6 h-6" />,
  },
  {
    id: "v_discount_10k",
    title: "Voucher giảm 10k",
    description: "Giảm trực tiếp vào hóa đơn",
    discountAmount: 10000,
    // Pastel Orange/Peach theme
    colorBg: "bg-orange-50",
    colorBorder: "border-orange-200",
    colorText: "text-orange-700",
    colorIconBg: "bg-orange-100 text-orange-500",
    icon: <TicketPercent className="w-6 h-6" />,
  },
];

const PaymentBillModal = ({
  isOpen,
  onClose,
  onConfirm,
  billData,
  loading,
}) => {
  const [selectedVoucherId, setSelectedVoucherId] = useState("v_none");
  const [finalTotal, setFinalTotal] = useState(0);

  // Tính toán lại tiền khi đổi voucher
  useEffect(() => {
    if (!billData) return;
    const voucher = AVAILABLE_VOUCHERS.find((v) => v.id === selectedVoucherId);
    let newTotal = billData.totalAmount;
    if (voucher) {
      if (voucher.discountType === "FREE") {
        newTotal = 0;
      } else if (voucher.discountAmount) {
        newTotal = Math.max(0, newTotal - voucher.discountAmount);
      }
    }
    setFinalTotal(newTotal);
  }, [selectedVoucherId, billData]);

  // Reset khi mở modal
  useEffect(() => {
    if (isOpen) setSelectedVoucherId("v_none");
  }, [isOpen]);

  if (!billData) return null;

  const selectedVoucher = AVAILABLE_VOUCHERS.find(
    (v) => v.id === selectedVoucherId
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Sử dụng rounded-3xl cho cảm giác mềm mại hơn */}
      <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-[2rem] bg-white shadow-2xl border-none outline-none font-sans">
        {/* LAYOUT 2 CỘT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[650px]">
          {/* === CỘT TRÁI (7/12): CHỌN GÓI / VOUCHER === */}
          <div className="lg:col-span-7 p-8 flex flex-col">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                {/* Logo giả lập với màu pastel */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-200 to-purple-200 flex items-center justify-center shadow-sm">
                  <Receipt className="w-5 h-5 text-blue-700" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  Chi tiết thanh toán
                </h2>
              </div>
              <p className="text-slate-500 pl-12">
                Chọn gói ưu đãi hoặc voucher để áp dụng.
              </p>
            </div>

            {/* Danh sách Vouchers */}
            <ScrollArea className="flex-1 -mr-4 pr-4">
              <div className="space-y-4">
                {AVAILABLE_VOUCHERS.map((voucher) => {
                  const isSelected = selectedVoucherId === voucher.id;
                  return (
                    <div
                      key={voucher.id}
                      onClick={() => setSelectedVoucherId(voucher.id)}
                      // Áp dụng màu nền pastel khi được chọn
                      className={cn(
                        "relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 flex items-center gap-5 group",
                        isSelected
                          ? cn(
                              voucher.colorBg,
                              voucher.colorBorder,
                              "shadow-sm scale-[1.01]"
                            )
                          : "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200"
                      )}
                    >
                      {/* Icon Box (Pastel) */}
                      <div
                        className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center shadow-sm transition-colors",
                          voucher.colorIconBg
                        )}
                      >
                        {voucher.icon}
                      </div>

                      {/* Nội dung */}
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4
                            className={cn(
                              "text-lg font-bold transition-colors",
                              isSelected ? voucher.colorText : "text-slate-700"
                            )}
                          >
                            {voucher.title}
                          </h4>
                          {/* Check icon (Màu theo theme pastel của thẻ) */}
                          {isSelected && (
                            <CheckCircle2
                              className={cn(
                                "w-7 h-7 fill-current",
                                voucher.colorText
                              )}
                            />
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                          {voucher.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Nút Hủy trên Mobile */}
            <div className="mt-6 lg:hidden">
              <Button
                variant="secondary"
                onClick={onClose}
                className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl"
              >
                Quay lại
              </Button>
            </div>
          </div>

          {/* === CỘT PHẢI (5/12): ORDER SUMMARY (Nền pastel xám/xanh nhẹ) === */}
          <div className="lg:col-span-5 bg-slate-50/80 p-8 border-l border-slate-100 flex flex-col h-full backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8">
              <DialogTitle className="text-xl font-bold text-slate-800">
                Tóm tắt đơn hàng
              </DialogTitle>
              <DialogClose className="rounded-full p-2 bg-white shadow-sm text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X className="w-5 h-5" />
              </DialogClose>
            </div>

            {/* Nội dung chi tiết */}
            <div className="flex-1 space-y-6">
              {/* Thông tin xe (Card màu trắng nổi bật trên nền pastel) */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-start gap-4 pb-4 border-b border-dashed border-slate-100">
                  <div className="w-12 h-12 bg-blue-100/50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Car size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                      Biển số xe
                    </p>
                    <p className="text-2xl font-bold text-slate-800 tracking-wide">
                      {billData.plateNumber}
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <MapPin size={16} className="text-slate-400" />{" "}
                    {billData.parkingSlot?.name || "Khu vực chung"}
                  </div>
                  <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 capitalize">
                    {billData.vehicleType}
                  </div>
                </div>
              </div>

              {/* List tính toán */}
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between text-slate-500">
                  <span>Giờ vào</span>
                  <span className="text-slate-800">
                    {new Date(billData.entryTime).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Giờ ra (dự kiến)</span>
                  <span className="text-slate-800">
                    {(billData.checkoutTime || new Date()).toLocaleString(
                      "vi-VN",
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </span>
                </div>

                <Separator className="my-4 bg-slate-200" />

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">
                    Tạm tính ({billData.durationHours}h)
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(billData.totalAmount)}
                  </span>
                </div>

                {/* Ưu đãi (Màu xanh pastel) */}
                {selectedVoucherId !== "v_none" && (
                  <div className="flex justify-between items-center text-teal-600 bg-teal-50 px-3 py-2 rounded-xl">
                    <span className="flex items-center gap-2">
                      <TicketPercent size={16} /> Ưu đãi áp dụng
                    </span>
                    <span className="font-bold">
                      -
                      {selectedVoucher.discountType === "FREE"
                        ? formatCurrency(billData.totalAmount)
                        : formatCurrency(selectedVoucher.discountAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-auto pt-6 border-t border-slate-200">
              <div className="flex justify-between items-end mb-6">
                <span className="text-slate-500 font-semibold">
                  Tổng thanh toán
                </span>
                <span className="text-4xl font-extrabold text-slate-800 tracking-tight">
                  {formatCurrency(finalTotal)}
                </span>
              </div>

              {/* Nút Thanh toán (Gradient Pastel) */}
              <Button
                onClick={() => onConfirm(finalTotal)}
                disabled={loading}
                // Sử dụng gradient pastel nhẹ nhàng
                className="w-full h-14 text-lg bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-200/50 transition-all hover:scale-[1.02] hover:shadow-blue-300/50"
              >
                {loading ? "Đang xử lý..." : "Thanh toán ngay"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentBillModal;
