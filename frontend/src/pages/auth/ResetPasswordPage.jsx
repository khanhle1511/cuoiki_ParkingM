import React from "react";
import { useAuth } from "@/context/AuthContext.jsx";
// 🚀 QUAN TRỌNG: DÒNG IMPORT CSS NÀY PHẢI CÓ
// Import các Icon
import {
  MotorcycleIcon,
  CarIcon,
  BicycleIcon,
} from "@/components/common/Icons.jsx";

function VehicleSelectionPage() {
  const { user, logout, selectVehicleType } = useAuth();

  const handleSelectVehicle = (type) => {
    selectVehicleType(type);
  };

  return (
    <div className="selection-page-container">
      {/* Phần chào mừng */}
      <div className="welcome-section">
        <h1 className="welcome-title">Chào, {user ? user.name : "Khách"}!</h1>
        <p className="welcome-subtitle">Vui lòng chọn loại xe bạn muốn gửi:</p>
      </div>

      {/* Grid lựa chọn phương tiện (3 cột) */}
      <div className="vehicle-grid">
        {/* Card Xe máy */}
        <div
          className="vehicle-card"
          onClick={() => handleSelectVehicle("motorbike")}
        >
          <span className="card-icon">
            <MotorcycleIcon className="w-16 h-16" />
          </span>
          <p className="card-title">Xe máy</p>
          <p className="card-description">Thích hợp cho các chỗ đỗ nhỏ.</p>
        </div>

        {/* Card Ô tô */}
        <div
          className="vehicle-card"
          onClick={() => handleSelectVehicle("car")}
        >
          <span className="card-icon">
            <CarIcon className="w-16 h-16" />
          </span>
          <p className="card-title">Ô tô</p>
          <p className="card-description">Yêu cầu một vị trí tiêu chuẩn.</p>
        </div>

        {/* Card Xe đạp */}
        <div
          className="vehicle-card"
          onClick={() => handleSelectVehicle("bicycle")}
        >
          <span className="card-icon">
            <BicycleIcon className="w-16 h-16" />
          </span>
          <p className="card-title">Xe đạp</p>
          <p className="card-description">Các vị trí gần lối ra vào.</p>
        </div>
      </div>

      {/* Nút Đăng xuất */}
      <div className="logout-button-container">
        <button onClick={logout} className="logout-button">
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default VehicleSelectionPage;
