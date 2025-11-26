import React from "react";
import { Phone, Mail, MapPin, Download } from "lucide-react";

const FooterBlock = () => {
  return (
    // Màu xanh dương nhạt (Pastel Blue) làm nền cho footer
    <footer className="bg-blue-800 text-white pt-10">
      {/* Khối trên cùng: Hotline, Địa chỉ, Liên kết */}
      <div className="max-w-7xl mx-auto px-4 pb-8 grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-blue-700">
        {/* Cột 1: Thông tin liên hệ */}
        <div>
          <h3 className="text-xl font-bold mb-3">TRUNG TÂM HỖ TRỢ</h3>
          <p className="text-4xl font-extrabold text-yellow-400 mb-2">
            1900 6067
          </p>
          <div className="space-y-2 text-sm">
            <p className="flex items-center">
              <MapPin size={16} className="mr-2" /> Địa chỉ: [Địa chỉ văn phòng]
            </p>
            <p className="flex items-center">
              <Mail size={16} className="mr-2" /> Email:{" "}
              <span className="text-yellow-300">hotro@parkingapp.vn</span>
            </p>
            <p className="flex items-center">
              <Phone size={16} className="mr-2" /> Điện thoại: 028.3838.8852
            </p>
          </div>
        </div>

        {/* Cột 2: App & Chứng nhận */}
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold mb-3">TẢI APP</h3>
          <div className="flex space-x-4">
            <button className="flex items-center bg-green-500 py-1 px-3 rounded text-sm font-semibold">
              <Download size={16} className="mr-1" /> CH Play
            </button>
            <button className="flex items-center bg-gray-600 py-1 px-3 rounded text-sm font-semibold">
              <Download size={16} className="mr-1" /> App Store
            </button>
          </div>
          <div className="mt-4 w-32 h-32 bg-blue-600 rounded-lg flex items-center justify-center text-sm">
            Chứng nhận
          </div>
        </div>

        {/* Cột 3: Về Ứng Dụng */}
        <div>
          <h3 className="text-lg font-semibold mb-3">VỀ ỨNG DỤNG</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="text-blue-300 hover:text-white">
                Về chúng tôi
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-300 hover:text-white">
                Điều khoản sử dụng
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-300 hover:text-white">
                Cơ hội việc làm
              </a>
            </li>
          </ul>
        </div>

        {/* Cột 4: Hỗ trợ */}
        <div>
          <h3 className="text-lg font-semibold mb-3">HỖ TRỢ</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="text-blue-300 hover:text-white">
                Tra cứu thông tin chỗ đỗ
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-300 hover:text-white">
                Hướng dẫn thanh toán
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-300 hover:text-white">
                Mạng lưới khu đỗ xe
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Khối dưới cùng: Copyright */}
      <div className="bg-blue-900 py-3 text-center text-sm">
        &copy; 2025 | Bản quyền thuộc về Công ty Parking App.
      </div>
    </footer>
  );
};

export default FooterBlock;
