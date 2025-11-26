import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// 2. Tính toán phí gửi xe
export const calculateParkingFee = (entryTime, hourlyRate) => {
  const start = new Date(entryTime);
  const now = new Date();

  // Tính phút
  const diffMs = now - start;
  const diffMins = Math.floor(diffMs / 60000);

  // Quy đổi ra giờ (Làm tròn lên: 61p = 2h)
  const durationHours = Math.max(1, Math.ceil(diffMins / 60));

  return {
    checkoutTime: now,
    durationHours: durationHours,
    hourlyRate: hourlyRate || 0,
    totalAmount: durationHours * (hourlyRate || 0),
  };
};
