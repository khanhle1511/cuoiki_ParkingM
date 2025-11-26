import React from "react";
// Đổi Navigate thành useNavigate hook
import { useNavigate } from "react-router-dom";
import { Truck, User, Menu, LogIn } from "lucide-react"; // Đã loại bỏ ChevronDown không dùng
import { Button } from "@/components/ui/button";

const PastelHeader = () => {
  // Khởi tạo hook useNavigate
  const navigate = useNavigate();

  return (
    <header className="bg-orange-200 pb-20">
      {" "}
      {/* Tăng padding bottom để tạo không gian cho FindParkinglotBlock */}
      {/* Thanh Bar Top (Màu cam sáng pastel) */}
      <div className="bg-orange-300 py-1"></div>
      {/* Thanh Menu Chính (Màu cam nhạt hơn) */}
      <div className="bg-white shadow-md">
        <div className="bg-white-300 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-black text-orange-600">
                PARKING
                <span className="text-green-600">APP</span>
              </div>
            </div>
            {/* Menu Items */}
            <nav className="hidden md:flex space-x-10">
              {[
                "TRANG CHỦ",
                "ƯU ĐÃI/VOUCHER",
                "THÔNG BÁO/TIN TỨC",
                "LIÊN HỆ",
                "VỀ CHÚNG TÔI",
              ].map((item, index) => (
                <a
                  key={item}
                  href="#"
                  className={`text-sm font-semibold py-2 px-3 rounded-full 
                  ${
                    index === 0
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:text-orange-600"
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Nút Đăng nhập/Đăng ký (Đã sửa lỗi và gắn navigation) */}
            {/* Sử dụng component Button làm container chính */}
            <Button
              onClick={() => navigate("/login")}
              className="hidden md:flex items-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2 px-4 rounded-full shadow-lg transition duration-150 h-10"
            >
              <LogIn size={16} className="mr-1" /> Đăng nhập
            </Button>

            {/* Mobile Menu */}
            <button className="md:hidden text-gray-700">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      {/* Banner - Loại bỏ -mt-10 và đặt Banner vào container mới */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 z-10 relative">
        <div className="bg-orange-100 rounded-xl shadow-xl p-6 border-4 border-orange-300">
          <div className="text-center py-6">
            <h1 className="text-3xl font-extrabold text-orange-800 mb-2">
              PARKING APP - ỨNG DỤNG ĐỖ XE THÔNG MINH
            </h1>
            <p className="text-lg text-gray-600">
              2 NĂM VỮNG TIN & PHÁT TRIỂN DỊCH VỤ ĐỖ XE CÔNG CỘNG
            </p>
          </div>
          {/* Hình ảnh minh họa giả lập (tái tạo bố cục) */}
          <div className="bg-orange-300 h-24 rounded-lg flex items-center justify-center text-white font-semibold mb-4">
            [Hình ảnh Minh họa Xe & Khu Đỗ Xe]
          </div>
        </div>
      </div>
    </header>
  );
};

export default PastelHeader;
