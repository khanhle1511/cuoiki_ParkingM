import React from "react";
import { Zap, Car, Bike } from "lucide-react";

// Định dạng tiền tệ
export const formatCurrency = (amount) =>
  amount
    ? amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    : "0 VND";

// Cấu hình các loại xe
// ĐÃ SỬA: Đổi file PricingConfig.js thành PricingConfig.jsx (khuyến nghị)
// Hoặc bao bọc JSX trong dấu ngoặc đơn () nếu môi trường hỗ trợ
export const VEHICLE_TYPES = [
  // Bắt buộc phải là file .jsx để chứa JSX
  {
    value: "Car",
    label: "Ô Tô",
    icon: <Car className="h-4 w-4" />,
    colorClass: "text-blue-600",
  },
  {
    value: "Motorbike",
    label: "Xe Máy",
    icon: <Zap className="h-4 w-4" />,
    colorClass: "text-green-600",
  },
  {
    value: "Bicycle",
    label: "Xe Đạp",
    icon: <Bike className="h-4 w-4" />,
    colorClass: "text-purple-600",
  },
];

// Cấu hình các loại gói
export const RATE_TYPES = [
  { value: "Hourly", label: "Giờ", unit: "/ giờ" },
  { value: "HalfMonthly", label: "Nửa Tháng" },
  { value: "Daily", label: "Ngày", unit: "/ ngày" },
  { value: "Monthly", label: "Tháng", unit: "/ tháng" },
  { value: "Yearly", label: "Năm", unit: "/ năm" },
];

// Lọc các loại gói không phải Hourly
export const SUBSCRIPTION_RATE_TYPES = RATE_TYPES.filter(
  (r) => r.value !== "Hourly"
);
