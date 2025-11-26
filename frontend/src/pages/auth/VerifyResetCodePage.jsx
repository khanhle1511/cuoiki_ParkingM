import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Lock,
  ArrowLeft,
  Loader2,
  Mail,
  AlertTriangle,
  KeyRound,
} from "lucide-react"; // Import Icons

// --- IMPORTS ẢNH LOCAL (ĐỒNG BỘ VỚI LOGIN/REGISTER) ---
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
// 🚀 IMPORT COMPONENT INPUT OTP
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

function VerifyResetCodePage() {
  const navigate = useNavigate();
  const storedEmail = sessionStorage.getItem("currentEmail");

  const [email, setEmail] = useState(storedEmail || "");
  const [code, setCode] = useState(""); // State này sẽ giữ toàn bộ chuỗi OTP
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // LOGIC BANNER XOAY VÒNG
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Chuyển hướng nếu không có email
  useEffect(() => {
    if (!storedEmail) {
      navigate("/forgot-password", { replace: true });
    }
  }, [storedEmail, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Kiểm tra độ dài mã (6 ký tự)
    if (!email || code.length !== 6) {
      setError("Mã xác thực phải đủ 6 chữ số.");
      setLoading(false);
      return;
    }

    try {
      // API Route: POST /api/auth/verify-reset-code
      const res = await axios.post("/api/auth/verify-reset-code", {
        email,
        code, // Gửi chuỗi code hoàn chỉnh
      });

      const { resetToken } = res.data;
      setMessage(
        res.data.message || "Mã xác thực hợp lệ. Đang chuyển hướng..."
      );

      // 1. LƯU resetToken vào sessionStorage
      sessionStorage.setItem("resetToken", resetToken);

      // 2. Chuyển hướng sang trang Reset Password
      setTimeout(() => {
        navigate("/reset-password", { replace: true });
      }, 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Mã khôi phục không hợp lệ hoặc đã hết hạn.";
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

      {/* Card UI 2 cột tương tự hình ảnh bạn gửi */}
      <Card className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl border-0 bg-white">
        {/* --- CỘT TRÁI: BANNER XOAY VÒNG (Đồng bộ) --- */}
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
                  Xác minh để khôi phục tài khoản
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: FORM XÁC MINH --- */}
        <div className="flex flex-col justify-center p-8 md:p-10 lg:px-12 h-full">
          <div className="mb-6">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-7 h-7 text-red-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Xác Thực Mã
            </h1>
            <p className="text-gray-500 text-sm">
              Mã OTP đã được gửi đến <strong>{email}</strong>. Vui lòng nhập mã
              bên dưới.
            </p>
          </div>

          {/* HIỂN THỊ THÔNG BÁO LỖI HOẶC THÀNH CÔNG (Dùng Alert) */}
          {error && (
            <Alert variant="destructive" className="mb-4 rounded-xl">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && (
            <Alert className="mb-4 rounded-xl bg-green-50 border-green-400 text-green-700">
              <Mail className="h-4 w-4 text-green-600" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* MÃ XÁC THỰC - SỬ DỤNG INPUT OTP */}
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => setCode(value)}
                className="space-x-1" // Giảm khoảng cách giữa các ô
              >
                <InputOTPGroup className="space-x-1">
                  <InputOTPSlot
                    index={0}
                    className="w-10 h-12 text-lg border-gray-300"
                  />
                  <InputOTPSlot
                    index={1}
                    className="w-10 h-12 text-lg border-gray-300"
                  />
                  <InputOTPSlot
                    index={2}
                    className="w-10 h-12 text-lg border-gray-300"
                  />
                  <InputOTPSlot
                    index={3}
                    className="w-10 h-12 text-lg border-gray-300"
                  />
                  <InputOTPSlot
                    index={4}
                    className="w-10 h-12 text-lg border-gray-300"
                  />
                  <InputOTPSlot
                    index={5}
                    className="w-10 h-12 text-lg border-gray-300"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="text-center text-sm text-gray-500 pt-2">
              Nhập 6 ký tự.
            </div>

            {/* Nút Xác thực */}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#3B4F50] hover:bg-[#D6A430] text-white font-bold shadow-md transition-all mt-4"
              disabled={loading || code.length !== 6} // Disable nếu code không đủ 6 ký tự
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                "Xác Thực"
              )}
            </Button>
          </form>

          {/* Quay lại Đăng nhập */}
          <div className="text-center text-sm text-gray-500 mt-6">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-semibold text-gray-600 hover:text-red-500 hover:underline flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại Đăng nhập
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default VerifyResetCodePage;
