import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ĐÃ SỬA: Import useNavigate
import axios from "axios";
import { Mail, Lock, Key, ArrowLeft } from "lucide-react"; // Import icons cần thiết

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, KeyRound } from "lucide-react"; // Đã thêm KeyRound

// ❌ ĐÃ XÓA: Không nhận các props onShowLogin, onShowVerifyReset nữa
function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Logic chuyển ảnh tự động (giả định)
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Vui lòng nhập địa chỉ email.");
      setLoading(false);
      return;
    }

    try {
      // API Route: POST /api/auth/forgot-password
      const res = await axios.post("/api/auth/forgot-password", { email });

      setMessage(
        res.data.message || "Mã khôi phục đã được gửi. Đang chuyển hướng..."
      );

      // === BƯỚC KHẮC PHỤC ===
      // 1. LƯU EMAIL VÀO SESSION STORAGE (Cần cho VerifyResetCodePage)
      sessionStorage.setItem("currentEmail", email);

      // 2. CHUYỂN HƯỚNG TỚI TRANG XÁC MINH MÃ bằng navigate
      setTimeout(() => {
        navigate("/verify-reset", { replace: true });
      }, 1000); // Đợi 1 giây để người dùng đọc thông báo thành công
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Lỗi. Không tìm thấy email hoặc hệ thống bận.";
      setError(errorMsg);
      // Xóa email khỏi sessionStorage nếu lỗi
      sessionStorage.removeItem("currentEmail");
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
      <Card className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl border-0 bg-white min-h-[500px]">
        {/* --- CỘT TRÁI: BANNER (Giữ nguyên) --- */}
        <div
          className="relative hidden md:block h-full bg-cover bg-center rounded-l-3xl p-8 transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${bannerImages[currentBannerIndex]})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-l-3xl"></div>
          <div className="relative z-10 flex flex-col justify-end h-full text-white">
            <div className="flex items-end gap-4 mt-auto">
              {/* ... (Phần Avatar và text) */}
              <div>
                <p className="font-bold text-lg">ParkingM</p>
                <p className="text-sm text-gray-300">
                  Hỗ trợ khôi phục tài khoản
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: FORM QUÊN MẬT KHẨU --- */}
        <div className="flex flex-col justify-center p-8 md:p-10 lg:px-12 h-full">
          <div className="mb-8 text-center">
            <KeyRound className="text-red-500 mx-auto mb-4 h-8 w-8" />
            <h1 className="text-2xl font-bold text-gray-900">Quên mật khẩu?</h1>
            <p className="text-gray-500 text-sm mt-2">
              Nhập email của bạn để nhận mã khôi phục.
            </p>
          </div>

          {/* HIỂN THỊ THÔNG BÁO */}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
                setMessage(null);
              }}
              required
              className="h-11 rounded-xl border-gray-300 focus:border-red-400 focus:ring-red-100"
            />

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-200 transition-all"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi Mã Khôi Phục"}
            </Button>
          </form>

          {/* Quay lại Đăng nhập */}
          <div className="text-center text-sm text-gray-500 mt-6">
            <button
              type="button"
              onClick={() => navigate("/login")} // SỬA: Dùng navigate trực tiếp
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

export default ForgotPasswordPage;
