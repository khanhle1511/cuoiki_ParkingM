import React, { useState, useEffect } from "react"; // Thêm useEffect
import { useNavigate } from "react-router-dom";
import { useAuth } from "/src/context/AuthContext";

// --- IMPORTS ẢNH LOCAL ---
import BgFullPage from "@/assets/images/bg-full-page.jpg";
import BannerLogin1 from "@/assets/images/banner-login-1.jpg"; // Đổi tên để dễ quản lý
import BannerLogin2 from "@/assets/images/banner-login-2.jpg";
import BannerLogin3 from "@/assets/images/banner-login-3.jpg";
import AvatarAndrew from "@/assets/images/avatar-andrew.jpg";

// Mảng chứa các ảnh banner sẽ được xoay vòng
const bannerImages = [BannerLogin1, BannerLogin2, BannerLogin3];

// --- SHADCN UI IMPORTS ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // --- LOGIC CHUYỂN ẢNH TỰ ĐỘNG ---
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex(
        (prevIndex) => (prevIndex + 1) % bannerImages.length
      );
    }, 2000); // Chuyển ảnh sau mỗi 2 giây

    return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
  }, []);
  // --------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await login(username, password);
      if (result.success && result.user.role === "User") {
        result.isParking
          ? navigate("/check-out")
          : navigate("/vehicle-selection");
      } else if (result.success && result.user.role === "Admin") {
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMsg);
      if (err.response?.data?.redirectTo === "/verify-email") {
        navigate("/verify-email", {
          state: { email: err.response.data.email },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleForgotPasswordClick = () => {
    navigate("/forgot-password");
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

      <Card className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl border-0 bg-white min-h-[600px]">
        {/* --- CỘT TRÁI: BANNER ẢNH NGHỆ THUẬT VỚI HIỆU ỨNG CHUYỂN ẢNH --- */}
        <div
          className="relative hidden md:block h-full bg-cover bg-center rounded-l-3xl p-8 transition-all duration-1000 ease-in-out" // Thêm transition cho hiệu ứng mượt mà
          style={{
            backgroundImage: `url(${bannerImages[currentBannerIndex]})`,
          }} // Sử dụng ảnh hiện tại
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-l-3xl"></div>

          <div className="relative z-10 flex flex-col justify-end h-full text-white">
            <div className="flex items-end gap-4 mt-auto">
              <img
                src={AvatarAndrew}
                alt="Andrew Avatar"
                className="w-12 h-12 rounded-full border-2 border-white shadow-lg object-cover"
              />
              <div>
                <p className="font-bold text-lg">ParkingM</p>
                <p className="text-sm text-gray-300">Chúc quý khách một ngày tốt lành </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: FORM ĐĂNG NHẬP (GIỮ NGUYÊN) --- */}
        <div className="flex flex-col justify-between p-8 md:p-12 lg:p-16 h-full">
          <div>
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
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
                <span className="text-xl font-bold text-gray-800">
                  ParkingM
                </span>
              </div>
            </div>
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900">ParkingM xin chào </h1>
              <p className="text-gray-500 mt-2"> Vui lòng đăng nhập ❤️</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  id="username"
                  type="username"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-300 focus:border-red-400 focus:ring-red-100 text-base"
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-300 focus:border-red-400 focus:ring-red-100 text-base"
                />
                <div className="text-right text-sm">
                  <button
                    type="button"
                    onClick={handleForgotPasswordClick}
                    className="text-yellow-500 hover:underline"
                  >
                    Forgot password ?
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#3B4F50] hover:bg-[#D6A430] text-white text-lg font-bold shadow-md shadow-red-200 transition-all"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </div>

          <div className="text-center text-sm text-gray-500 mt-auto">
            bạn chưa có tài khoản ?{" "}
            <button
              onClick={handleRegisterClick}
              className="font-semibold text-yellow-500 hover:underline"
            >
              Đăng kí
            </button>
          </div>

          <div className="flex justify-center gap-5 mt-8 text-gray-400">
            <a href="#" className="hover:text-gray-700 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="#" className="hover:text-gray-700 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17-19 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a href="#" className="hover:text-gray-700 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a href="#" className="hover:text-gray-700 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.6 44.07 44.07 0 0 1 15.2 0 2 2 0 0 1 1.4 1.6 24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.6 44.07 44.07 0 0 1-15.2 0 2 2 0 0 1-1.4-1.6z" />
                <path d="m10 15 5-3-5-3v6z" />
              </svg>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
