import React from "react";
// 🚀 SỬA LỖI ĐƯỜNG DẪN: (Đi ra 2 cấp)
import { useAuth } from "../../context/AuthContext.jsx";
// 🚀 SỬA LỖI ĐƯỜNG DẪN: (Đi ra 2 cấp)
import "../../pages/VehicleSelectionPage.css";
// 🚀 SỬA LỖI ĐƯỜNG DẪN: (Đi ra 1 cấp, vào common)
import { ChevronRightIcon } from "../common/LayoutIcons.jsx";

function UserHome({ onStartParking }) {
  const { user } = useAuth();

  return (
    <div className="selection-page-container">
      {/* Phần chào mừng */}
      <div className="welcome-section">
        <h1 className="welcome-title">Chào, {user ? user.name : "bạn"}!</h1>
        <p className="welcome-subtitle">
          Chào mừng đến với Bãi đỗ xe thông minh.
        </p>
      </div>

      {/* Grid lựa chọn (chỉ có 1 nút) */}
      <div className="vehicle-grid">
        {/* === NÚT HÀNH ĐỘNG CHÍNH === */}
        <div
          className="vehicle-card"
          onClick={onStartParking} // <-- Gọi hàm từ ParkingModule
        >
          {/* (Tùy chọn) Bạn có thể thêm Icon xe hơi/đỗ xe ở đây */}
          <div
            className="card-icon-wrapper"
            style={{ backgroundColor: "#4f46e5" /* Màu tím */ }}
          >
            <svg
              className="card-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
          </div>

          <div className="card-content">
            <p className="card-title">Đỗ xe ngay</p>
            <p className="card-description">
              Tìm chỗ và bắt đầu phiên đỗ xe mới.
            </p>
          </div>

          <ChevronRightIcon className="arrow-icon" />
        </div>
      </div>
    </div>
  );
}

export default UserHome;
