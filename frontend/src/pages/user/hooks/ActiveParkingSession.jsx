import React, { useState } from "react";
import axios from "axios";
import { LogOut, Clock, MapPin, Car, Hash } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import PaymentConfirmationModal from "@/components/common/PaymentConfirmationModal";
import { calculateParkingFee } from "@/lib/utils";

const ActiveParkingSession = ({ activeLog, onCheckoutSuccess }) => {
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePrepareCheckout = async () => {
    if (!activeLog) {
      alert("Không tìm thấy thông tin xe đang gửi!");
      return;
    }
    setLoading(true);

    try {
      const realCheckInTime = activeLog.checkInTime || new Date();
      const realPlateNumber = activeLog.licensePlate || "Chưa cập nhật";

      const res = await axios.get("/api/pricing");
      const pricingList = res.data;

      const priceConfig = pricingList.find(
        (p) =>
          p.vehicleType?.toLowerCase() === activeLog.vehicleType?.toLowerCase()
      );

      const currentRate = priceConfig
        ? priceConfig.pricePerHour || priceConfig.rate
        : 0;

      const bill = calculateParkingFee(realCheckInTime, currentRate);

      setPaymentData({
        totalAmount: bill.totalAmount,
        entryTime: realCheckInTime,
        duration: bill.durationHours,
        licensePlate: realPlateNumber,
        vehicleType: activeLog.vehicleType,
        logId: activeLog._id, // ID này sẽ được dùng khi thanh toán
        hourlyRate: currentRate,
      });

      setIsBillOpen(true);
    } catch (error) {
      console.error("Lỗi chuẩn bị checkout:", error);
      alert("Có lỗi xảy ra: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (logId, discountId) => {
    // Kiểm tra an toàn
    if (!logId) {
      alert("Lỗi: Không tìm thấy ID phiên đỗ xe.");
      return;
    }

    setLoading(true);
    try {
      // Gọi API với logId chính xác
      await axios.post(`/api/vehicle/checkout/${logId}`, {
        discountId: discountId,
      });

      setIsBillOpen(false);
      if (onCheckoutSuccess) onCheckoutSuccess();
    } catch (error) {
      alert(
        "Thanh toán thất bại: " +
          (error.response?.data?.message || "Lỗi không xác định")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!activeLog) return null;

  return (
    <>
      <Card className="border-l-4 border-l-orange-500 shadow-lg bg-white transition-all hover:shadow-xl overflow-hidden">
        <CardHeader className="pb-2 bg-orange-50/50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-orange-700">
                Trạng thái đỗ xe
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Thông tin chi tiết phiên đỗ xe hiện tại của bạn.
              </p>
            </div>
            <Badge
              className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 px-3 py-1"
              variant="outline"
            >
              Đang đỗ
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                <Car className="w-3 h-3" /> Loại xe
              </span>
              <span className="font-bold text-gray-800 text-lg capitalize">
                {activeLog.vehicleType === "motorbike" ? "Xe máy" : "Ô tô"}
              </span>
            </div>

            <div className="flex flex-col space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                <Hash className="w-3 h-3" /> Biển số
              </span>
              <div className="bg-gray-100 px-3 py-1 rounded-md w-fit border border-gray-300">
                <span className="font-mono font-bold text-gray-800 text-lg">
                  {activeLog.licensePlate || "---"}
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Vị trí đỗ
              </span>
              <span className="font-bold text-blue-600 text-2xl">
                {activeLog.parkingSlot ? activeLog.parkingSlot.name : "N/A"}
              </span>
            </div>

            <div className="flex flex-col space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3" /> Giờ vào
              </span>
              <span className="font-medium text-gray-700">
                {new Date(activeLog.checkInTime).toLocaleTimeString("vi-VN")}
                <br />
                <span className="text-xs text-gray-400">
                  {new Date(activeLog.checkInTime).toLocaleDateString("vi-VN")}
                </span>
              </span>
            </div>
          </div>

          {activeLog.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-xs text-gray-500 italic">
                Ghi chú: {activeLog.notes}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-gray-50 flex justify-end py-4 px-6 border-t border-gray-100">
          <Button
            onClick={handlePrepareCheckout}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md hover:shadow-xl transition-all flex items-center gap-2"
          >
            {loading ? (
              "Đang tính tiền..."
            ) : (
              <>
                <LogOut className="h-4 w-4" /> Lấy xe (Check-out)
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {isBillOpen && paymentData && (
        <PaymentConfirmationModal
          parkingData={paymentData}
          onClose={() => setIsBillOpen(false)}
          // 🔥 FIX CHÍNH XÁC TẠI ĐÂY:
          onConfirmPayment={(discountId) =>
            handleConfirmPayment(paymentData.logId, discountId)
          }
          isProcessing={loading}
        />
      )}
    </>
  );
};

export default ActiveParkingSession;
