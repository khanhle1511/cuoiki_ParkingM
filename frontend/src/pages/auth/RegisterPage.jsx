import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "/src/context/AuthContext";
// THÊM AXIOS VÀO ĐÂY
import axios from "axios";

// --- IMPORTS ẢNH LOCAL (Đồng bộ với Login) ---
// [Khối import ảnh giữ nguyên]
import BgFullPage from "@/assets/images/bg-full-page.jpg";
import BannerLogin1 from "@/assets/images/banner-login-1.jpg";
import BannerLogin2 from "@/assets/images/banner-login-2.jpg";
import BannerLogin3 from "@/assets/images/banner-login-3.jpg";
import AvatarAndrew from "@/assets/images/avatar-andrew.jpg";

const bannerImages = [BannerLogin1, BannerLogin2, BannerLogin3];

// --- SHADCN UI IMPORTS ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function RegisterPage() {
  const navigate = useNavigate();
  // Giả sử context có hàm register, nhưng hiện tại dùng axios trực tiếp
  const { register } = useAuth();

  // State quản lý form
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- LOGIC CHUYỂN ẢNH TỰ ĐỘNG ---
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Hàm xử lý thay đổi input chung
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate mật khẩu
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      setLoading(false);
      return;
    }

    // Dữ liệu gửi đi (Mapping tên biến)
    const registrationData = {
      name: formData.fullName, // Map fullName -> name
      mobile: formData.mobile,
      email: formData.email,
      username: formData.username,
      password: formData.password,
    };

    try {
      // Gọi API đăng ký
      const res = await axios.post("/api/auth/register", registrationData);

      // === SỬA LỖI TẠI ĐÂY (Ngăn chặn tự động đăng nhập) ===

      // 1. Nếu Backend trả về token, nó sẽ nằm trong res.data.token
      // Dù Backend không nên làm điều này, chúng ta cần dọn dẹp nó ở Frontend
      if (res.data.token) {
        // XÓA BẤT KỲ TOKEN NÀO ĐƯỢC LƯU NGAY LẬP TỨC
        // Điều này ngăn chặn AuthContext nghĩ rằng người dùng đã đăng nhập
        localStorage.removeItem("authToken");
      }

      // Backend thường trả lại email của user vừa đăng ký trong res.data
      const emailForVerification = res.data.email || formData.email;
      sessionStorage.setItem("currentEmail", emailForVerification);

      // 2. Chuyển hướng đến trang xác minh email
      navigate("/verify-email", { replace: true });
    } catch (err) {
      // Bắt lỗi từ response API (ví dụ: 400 Bad Request)
      setError(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 font-sans relative"
      style={{
        backgroundImage: `url(${BgFullPage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/10 z-0"></div>

      {/* Card lớn hơn Login (min-h-[700px]) để chứa form dài */}
      <Card className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl border-0 bg-white min-h-[700px]">
        {/* --- CỘT TRÁI: BANNER (Đồng bộ Login) --- */}
        <div
          className="relative hidden md:block h-full bg-cover bg-center rounded-l-3xl p-8 transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${bannerImages[currentBannerIndex]})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-l-3xl"></div>
          <div className="relative z-10 flex flex-col justify-end h-full text-white">
            <div className="flex items-end gap-4 mt-auto">
              <img
                src={AvatarAndrew}
                alt="Avatar"
                className="w-12 h-12 rounded-full border-2 border-white shadow-lg object-cover"
              />
              <div>
                <p className="font-bold text-lg">ParkingM</p>
                <p className="text-sm text-gray-300">
                  Tham gia ngay hôm nay ❤️
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: FORM ĐĂNG KÝ --- */}
        <div className="flex flex-col justify-center p-8 md:p-12 lg:px-16 h-full overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-800"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="text-lg font-bold text-gray-800">ParkingM</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tạo tài khoản mới
            </h1>
            <p className="text-gray-500 text-sm">Điền thông tin để bắt đầu.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hàng 1: Tên đăng nhập & Họ tên */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="username"
                placeholder="Tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                required
                className="h-11 rounded-xl border-gray-300 focus:border-red-400 focus:ring-red-100"
              />
              <Input
                id="fullName"
                placeholder="Họ và tên"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="h-11 rounded-xl border-gray-300 focus:border-red-400 focus:ring-red-100"
              />
            </div>

            {/* Hàng 2: Email & SĐT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11 rounded-xl border-gray-300 focus:border-red-400 focus:ring-red-100"
              />
              <Input
                id="mobile"
                placeholder="Số điện thoại"
                value={formData.mobile}
                onChange={handleChange}
                // required (Tùy chọn)
                className="h-11 rounded-xl border-gray-300 focus:border-red-400 focus:ring-red-100"
              />
            </div>

            {/* Mật khẩu */}
            <Input
              id="password"
              type="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
              required
              className="h-11 rounded-xl border-gray-300 focus:border-red-400 focus:ring-red-100"
            />

            {/* Nhập lại mật khẩu */}
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="h-11 rounded-xl border-gray-300 focus:border-red-400 focus:ring-red-100"
            />

            {error && (
              <p className="text-red-500 text-sm text-center font-medium">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#3B4F50] hover:bg-[#D6A430] text-white font-bold shadow-md shadow-red-200 mt-2 transition-all"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đăng Ký Ngay"}
            </Button>
          </form>

          {/* Footer chuyển qua Login */}
          <div className="text-center text-sm text-gray-500 mt-6">
            Đã có tài khoản?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-semibold text-yellow-500 hover:underline"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RegisterPage;
