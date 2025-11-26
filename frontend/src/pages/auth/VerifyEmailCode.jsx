import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Lock } from "lucide-react"; // Dùng Lock từ lucide-react thay vì LayoutIcons.jsx

// --- IMPORTS ẢNH LOCAL (Đồng bộ với Login/Register) ---
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MailCheck, AlertTriangle } from "lucide-react";

function VerifyEmailCode() {
  const navigate = useNavigate();
  // 1. Lấy email từ sessionStorage (đã được lưu sau khi đăng ký)
  const storedEmail = sessionStorage.getItem("currentEmail");

  const [email, setEmail] = useState(storedEmail || "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // LOGIC CHUYỂN ẢNH TỰ ĐỘNG
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 2. Chuyển hướng nếu không có email
  useEffect(() => {
    // Nếu không có email được lưu trong sessionStorage, đẩy về trang đăng nhập
    if (!storedEmail) {
      navigate("/login", { replace: true });
    }
  }, [storedEmail, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Sử dụng state email đã được khởi tạo từ storedEmail
    if (!email || !code) {
      setError("Vui lòng cung cấp email và mã xác thực.");
      setLoading(false);
      return;
    }

    try {
      // API Route: POST /api/auth/verify-code
      const res = await axios.post("/api/auth/verify-code", {
        email,
        code,
      });

      // API của bạn có thể trả về token sau khi xác thực thành công.
      if (res.data.token) {
        localStorage.setItem("authToken", res.data.token);
      }

      setMessage(res.data.message || "Xác thực thành công. Đang đăng nhập...");

      // 3. Dọn dẹp session storage và chuyển về trang đăng nhập
      sessionStorage.removeItem("currentEmail");

      // Chuyển hướng sau khi thông báo thành công
      setTimeout(() => {
        // Chuyển hướng tới trang Login hoặc Dashboard (nếu có token)
        navigate(res.data.token ? "/dashboard" : "/login", { replace: true });
      }, 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Mã xác thực không hợp lệ hoặc đã hết hạn.";
      setError(errorMsg);
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

      {/* Card UI 2 cột tương tự Login/Register */}
      <Card className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl border-0 bg-white min-h-[600px]">
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
                  Xác minh và trở thành thành viên ngay!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢẢI: FORM XÁC MINH --- */}
        <div className="flex flex-col justify-center p-8 md:p-12 lg:px-16 h-full">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <MailCheck className="text-gray-800 h-6 w-6" />
              <span className="text-xl font-bold text-gray-800">ParkingM</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Xác Thực Email</h1>
            <p className="text-gray-500 text-sm mt-2">
              Một mã OTP đã được gửi đến <strong>{email}</strong>. Vui lòng nhập
              mã để hoàn tất đăng ký.
            </p>
          </div>

          {/* HIỂN THỊ THÔNG BÁO LỖI HOẶC THÀNH CÔNG (Dùng Alert) */}
          {error && (
            <Alert variant="destructive" className="mb-4 rounded-xl">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Lỗi Xác thực</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && (
            <Alert className="mb-4 rounded-xl bg-green-50 border-green-400 text-green-700">
              <MailCheck className="h-4 w-4 text-green-600" />
              <AlertTitle>Thành công</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mã Xác thực */}
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mã OTP (6 chữ số)
              </label>
              <Input
                id="code"
                name="code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-12 rounded-xl border-gray-300 text-lg text-center tracking-[0.5em] focus:border-red-400 focus:ring-red-100"
                placeholder="123456"
                maxLength={6}
              />
            </div>

            {/* Nút Xác thực */}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#3B4F50] hover:bg-[#D6A430] text-white font-bold shadow-md shadow-red-200 transition-all"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Xác Thực"}
            </Button>
          </form>

          {/* Quay lại Đăng nhập */}
          <div className="text-center text-sm text-gray-500 mt-6">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-semibold text-yellow-500 hover:underline"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default VerifyEmailCode;
