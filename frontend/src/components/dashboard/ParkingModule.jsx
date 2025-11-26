import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

// Import các component con
import FullParkingMap from "./FullParkingMap.jsx"; // 🚀 Dùng bản đồ MỚI ĐẸP
import AdminDashboard from "../../pages/admin/AdminDashboard.jsx"; // (Tạo file này nếu chưa có, hoặc viết inline dưới đây)
import ActiveParkingSession from "../../pages/user/hooks/ActiveParkingSession.jsx"; // (Tách ra cho gọn)
import UserHome from "./UserHome.jsx";
import VehicleSelectionPage from "../../pages/user/VehicleSelectionPage.jsx";

// =================================================================
// === COMPONENT ĐIỀU HƯỚNG CHÍNH ===
// =================================================================
function ParkingModule() {
  const { user, activeLog, vehicleTypeToPark, resetVehicleType } = useAuth();

  const [parkingStep, setParkingStep] = useState("home");

  // 1. Giao diện Admin
  if (user?.role === "Admin" || user?.role === "Manager") {
    // Nếu bạn chưa tách AdminDashboard ra file riêng,
    // bạn có thể import FullParkingMap vào đây để Admin cũng thấy map đẹp
    return <AdminDashboard />;
  }

  // === GIAO DIỆN USER ===

  // 2. User đang có xe trong bãi -> Hiện Check-out
  if (activeLog) {
    return <ActiveParkingSession />;
  }

  // 3. User đang chọn chỗ (Đã chọn loại xe) -> Hiện Map Mới
  if (vehicleTypeToPark) {
    return (
      <div className="p-4">
        {/* Nút quay lại chọn xe khác */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-700">
            Đang chọn chỗ cho:{" "}
            <span className="text-blue-600 uppercase">{vehicleTypeToPark}</span>
          </h2>
          <button
            onClick={resetVehicleType}
            className="text-sm text-slate-500 hover:text-blue-600 underline"
          >
            Chọn loại xe khác
          </button>
        </div>

        {/* 🚀 HIỂN THỊ BẢN ĐỒ XỊN Ở ĐÂY */}
        <FullParkingMap filterVehicleType={vehicleTypeToPark} />
      </div>
    );
  }

  // 4. Flow chọn xe (Mới)
  if (parkingStep === "selecting_vehicle") {
    return <VehicleSelectionPage onBack={() => setParkingStep("home")} />;
  }

  // 5. Mặc định: Trang chủ User
  return (
    <UserHome onStartParking={() => setParkingStep("selecting_vehicle")} />
  );
}

export default ParkingModule;
