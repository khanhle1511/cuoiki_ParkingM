import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSign,
  Loader2,
  CheckCircle,
  Car,
  Zap,
  Bike,
  TrendingUp,
} from "lucide-react";
import { VEHICLE_TYPES } from "@/config/PricingConfig.jsx";
import { cn } from "@/lib/utils";

// --- HELPERS ĐỊNH DẠNG VND ---
const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseNumber = (value) => {
  return parseInt(String(value).replace(/\./g, "")) || 0;
};
// -----------------------------

// Màu sắc đồng bộ (ĐÃ TĂNG CƯỜNG ĐỘ MÀU NỀN)
const CARD_COLORS = {
  // 🔥 Đã thay đổi bg: bg-blue-100/200 và fill: bg-blue-600/700
  Car: {
    text: "text-blue-700",
    border: "border-blue-300",
    bg: "bg-blue-100",
    fill: "bg-blue-600",
    light_bg: "bg-blue-200",
  },
  Motorbike: {
    text: "text-green-700",
    border: "border-green-300",
    bg: "bg-green-100",
    fill: "bg-green-600",
    light_bg: "bg-green-200",
  },
  Bicycle: {
    text: "text-purple-700",
    border: "border-purple-300",
    bg: "bg-purple-200",
    fill: "bg-purple-600",
    light_bg: "bg-purple-200",
  },
};

// =================================================================
// === COMPONENT CON: HOURLY PRICE CARD (Đơn vị submit) ===
// =================================================================
function HourlyPriceCard({ type, currentRate, onRefresh, colors }) {
  const [rate, setRate] = useState(currentRate || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Đồng bộ state cục bộ khi currentRate từ props thay đổi (sau khi refresh)
  useEffect(() => {
    setRate(currentRate || 0);
    setMessage(null);
  }, [currentRate]);

  // Tên icon tương ứng
  const IconComponent =
    type.value === "Car" ? Car : type.value === "Motorbike" ? Zap : Bike;

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        vehicleType: type.value,
        rate: rate,
      };

      // GỌI API SINGLE UPDATE: PUT /api/admin/pricing/hourly/single
      await axios.put("/api/admin/pricing/hourly/single", payload);

      setMessage("Đã lưu!");
      onRefresh(); // Kích hoạt tải lại dữ liệu toàn cục
    } catch (err) {
      // Lỗi 409 (Conflict) hoặc các lỗi khác từ Backend
      setError(err.response?.data?.message || "Lỗi khi cập nhật giá.");
    } finally {
      setLoading(false);
    }
  };

  const handleRateChange = (value) => {
    // Xử lý định dạng input
    const cleanedValue = value.replace(/[^0-9.]/g, "");
    const numericValue = parseNumber(cleanedValue);
    setRate(numericValue);
    if (message) setMessage(null);
    if (error) setError(null);
  };

  const isRateChanged = rate !== currentRate;
  const rateDisplay = formatNumber(currentRate) + " đ";

  return (
    // UI/UX: Thẻ bo tròn, border đậm, màu pastel, hiệu ứng đổ bóng
    <Card
      key={type.value}
      className={cn(
        "shadow-xl rounded-2xl transition-all duration-300 hover:shadow-2xl",
        colors.bg, // Màu nền pastel đậm hơn
        // Border bên ngoài để tạo hiệu ứng viền nổi bật
        `border-4 border-transparent hover:border-${colors.text.slice(5)}`
      )}
    >
      <CardHeader className={cn("pb-2 pt-4 px-5 border-b-2", colors.border)}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Icon và Tiêu đề */}
            <div
              className={cn(
                "p-1.5 rounded-full shadow-md",
                colors.light_bg,
                colors.text
              )}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <CardTitle className={cn("text-xl font-extrabold", colors.text)}>
              Giá {type.label}
            </CardTitle>
          </div>

          {/* Hiển thị giá hiện tại LỚN */}
          <span className={cn("text-2xl font-bold", colors.text)}>
            {rateDisplay}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        {/* TRƯỜNG NHẬP GIÁ MỚI */}
        <div className="space-y-1">
          <Label className="text-sm font-semibold text-slate-600">
            Giá mới (VND/Giờ)
          </Label>
          <Input
            type="text"
            value={formatNumber(rate)}
            onChange={(e) => handleRateChange(e.target.value)}
            placeholder="0"
            min={0}
            // UI: Input lớn, focus nổi bật
            className={cn(
              "h-12 rounded-xl border-2 text-xl font-bold focus:border-current",
              colors.text.replace("text-", "border-").replace("-700", "-500"),
              "bg-white shadow-inner"
            )}
          />
        </div>

        {/* Feedback area */}
        {error && (
          <Alert variant="destructive" className="rounded-lg text-sm p-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert className="rounded-lg bg-green-100 border-green-300 text-green-700 text-sm p-3">
            <AlertDescription>
              <CheckCircle className="h-4 w-4 inline mr-2" /> {message}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleUpdate}
          disabled={loading || !isRateChanged || rate < 0} // Cho phép 0 (Miễn phí)
          // UI: Nút màu sắc động, hiệu ứng nổi bật
          className={cn(
            "w-full h-11 font-bold rounded-xl shadow-lg transition-all",
            colors.fill,
            `shadow-${colors.text.slice(5)}-300`
          )}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            "Lưu Thay Đổi Giá"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
// === COMPONENT CHÍNH: HOURLY PRICE EDITOR ===
// =================================================================
function HourlyPriceEditor({ pricingData, onRefresh, isLoading }) {
  // Chuyển dữ liệu mảng thành map (dễ truy cập)
  const ratesMap = new Map();
  pricingData.forEach((p) => ratesMap.set(p.vehicleType, p.rate));

  // Lấy các icon cho từng loại xe
  const CARD_COLORS_MAP = {
    Car: CARD_COLORS.Car,
    Motorbike: CARD_COLORS.Motorbike,
    Bicycle: CARD_COLORS.Bicycle,
  };

  return (
    // Khối tổng quan lớn hơn, đổ bóng sâu hơn
    <Card className="shadow-2xl border border-slate-100 bg-white rounded-2xl p-6">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-blue-600" /> Cập Nhật Giá Theo Giờ
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-6">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          </div>
        ) : (
          // GRID CHÍNH: 3 CỘT CHO 3 LOẠI XE
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VEHICLE_TYPES.map((type) => (
              <HourlyPriceCard
                key={type.value}
                type={type}
                currentRate={ratesMap.get(type.value)}
                onRefresh={onRefresh}
                colors={CARD_COLORS_MAP[type.value]}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HourlyPriceEditor;
