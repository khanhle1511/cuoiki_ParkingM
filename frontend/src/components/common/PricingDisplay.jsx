import React, { useState, useEffect } from "react";
import axios from "axios";
// 🎯 Import CSS từ sơ đồ bãi xe để dùng chung style "shadcn"
import "../dashboard/ParkingMap.css";

// Hàm định dạng tiền tệ (Giữ nguyên)
const formatCurrency = (amount) => {
  return amount
    ? amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    : "Liên hệ";
};
const VEHICLE_TYPES = ["Car", "Motorbike", "Bicycle"];

// -------------------------------------------------------------
// === Component Hiển thị Bảng giá (Sử dụng API Public) ===
// -------------------------------------------------------------
export const PricingDisplay = () => {
  const [pricingData, setPricingData] = useState([]);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [pricingError, setPricingError] = useState(null);

  // --- LOGIC FETCH VÀ GROUP DATA (GIỮ NGUYÊN) ---
  useEffect(() => {
    const fetchPricing = async () => {
      setLoadingPricing(true);
      try {
        const res = await axios.get("/api/pricing");
        setPricingData(res.data);
      } catch (err) {
        console.error("Lỗi khi tải bảng giá:", err);
        setPricingError(
          "Không thể tải bảng giá hiện tại. Vui lòng kiểm tra Server."
        );
      } finally {
        setLoadingPricing(false);
      }
    };
    fetchPricing();
  }, []);

  const groupPricing = (list) => {
    const grouped = {
      Hourly: { Car: null, Motorbike: null, Bicycle: null },
      Subscription: { Car: [], Motorbike: [], Bicycle: [] },
    };

    list.forEach((item) => {
      if (item.rateType === "Hourly") {
        grouped.Hourly[item.vehicleType] = item;
      } else {
        if (grouped.Subscription[item.vehicleType]) {
          grouped.Subscription[item.vehicleType].push(item);
        }
      }
    });
    return grouped;
  };

  const groupedData = groupPricing(pricingData);

  // --- RENDER LOADING / ERROR (Style Shadcn) ---
  if (loadingPricing) {
    return (
      <div className="p-4 text-center text-[--muted-foreground]">
        Đang tải bảng giá...
      </div>
    );
  }
  if (pricingError) {
    // Sử dụng style "destructive"
    return (
      <div className="p-4 text-center text-[--destructive] border border-[--destructive] bg-red-50 rounded-[--radius]">
        {pricingError}
      </div>
    );
  }

  // --- RENDER GIAO DIỆN SHADCN UI ---
  return (
    // Sử dụng font-sans từ ParkingMap.css
    <div className="font-sans">
      {/* --- 1. GIÁ ĐỖ XE THEO GIỜ --- */}
      {/* <h2> được style tự động bởi ParkingMap.css */}
      <h2>Giá Đỗ Xe Theo Giờ</h2>

      {/* Tái sử dụng grid và card style từ ParkingMap.css */}
      <div
        className="parking-map-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        {VEHICLE_TYPES.map((type) => {
          const item = groupedData.Hourly[type];
          const name =
            type === "Car"
              ? "Ô Tô"
              : type === "Motorbike"
              ? "Xe Máy"
              : "Xe Đạp";

          return (
            // Card (parking-quadrant)
            <div key={type} className="parking-quadrant">
              {/* Card Header (quadrant-title) */}
              <h3 className="quadrant-title">{name}</h3>

              {/* Card Content (parking-lot-map) */}
              <div className="parking-lot-map">
                {item ? (
                  <>
                    <p className="text-3xl font-bold text-[--accent]">
                      {formatCurrency(item.rate)}
                    </p>
                    <p className="text-sm text-[--muted-foreground]">/ giờ</p>
                  </>
                ) : (
                  <p className="text-lg font-medium text-[--muted-foreground]">
                    N/A
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- 2. GÓI DỊCH VỤ (VÉ THÁNG, NGÀY) --- */}
      <h2>Gói Dịch Vụ (Vé Tháng, Ngày)</h2>

      {/* Dùng 1 Card lớn chứa danh sách */}
      <div className="parking-quadrant">
        <h3 className="quadrant-title">Danh sách gói</h3>
        {/* Chúng ta dùng 1 danh sách đơn giản với border
                  style={{padding: 0}} để xóa padding mặc định của parking-lot-map
                */}
        <div className="parking-lot-map" style={{ padding: 0 }}>
          <div className="w-full">
            {VEHICLE_TYPES.map((type, index) => {
              const list = groupedData.Subscription[type];
              const name =
                type === "Car"
                  ? "🚗 Ô Tô"
                  : type === "Motorbike"
                  ? "🛵 Xe Máy"
                  : "🚲 Xe Đạp";

              return (
                <div
                  key={type}
                  // Thêm border-b (viền dưới) cho các item, trừ item cuối
                  className={`p-6 ${
                    index < VEHICLE_TYPES.length - 1
                      ? "border-b border-[--border]"
                      : ""
                  }`}
                >
                  {/* Tiêu đề của loại xe (Ô tô, Xe máy...) */}
                  <h4 className="text-lg font-semibold text-[--primary] mb-3">
                    {name}
                  </h4>

                  {list && list.length > 0 ? (
                    // Danh sách các gói
                    <ul className="space-y-2 pl-4">
                      {list
                        .sort((a, b) => a.durationValue - b.durationValue) // Sắp xếp
                        .map((sub) => (
                          <li
                            key={sub._id}
                            className="flex justify-between items-center"
                          >
                            <span className="text-[--muted-foreground]">
                              {sub.name}
                            </span>
                            <span className="font-bold text-lg text-[--foreground]">
                              {formatCurrency(sub.rate)}
                            </span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    // Trạng thái trống
                    <p className="pl-4 text-sm text-[--muted-foreground] italic">
                      Chưa có gói đăng ký.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
