import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate
// Import thêm icons để hiển thị trạng thái đẹp hơn
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

// --- IMPORTS ẢNH LOCAL (ĐÃ XÓA IMPORTS, CHUYỂN SANG DÙNG ĐƯỜNG DẪN PUBLIC) ---
// Giả định các ảnh nằm trong thư mục public/assets/images/ và được tham chiếu trực tiếp

const BgFullPage = "/assets/images/bg-full-page.jpg";
const BannerLogin1 = "/assets/images/banner-login-1.jpg";
const BannerLogin2 = "/assets/images/banner-login-2.jpg";
const BannerLogin3 = "/assets/images/banner-login-3.jpg";
const AvatarAndrew = "/assets/images/avatar-andrew.jpg";

const bannerImages = [BannerLogin1, BannerLogin2, BannerLogin3];

// --- SHADCN UI IMPORTS ---
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function VerifyEmailPage() {
  // Thêm useNavigate
  const navigate = useNavigate(); // ========================================================== // 1. LOGIC GỐC (GIỮ NGUYÊN 100%) // ==========================================================
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Đang xác thực tài khoản của bạn...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setMessage("Không tìm thấy token xác thực.");
      setIsError(true);
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        // Sửa API endpoint: /api/v1/auth/verify/:token
        const res = await axios.get(`/api/v1/auth/verify/${token}`);
        setMessage(res.data.message);
        setIsError(false);
      } catch (err) {
        setMessage(
          err.response?.data?.message || "Lỗi. Token không hợp lệ hoặc hết hạn."
        );
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []); // ========================================================== // 2. LOGIC UI MỚI (Banner xoay vòng) // ==========================================================

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []); // Hàm điều hướng đến Login

  const handleNavigateToLogin = () => {
    navigate("/login");
  }; // ========================================================== // 3. RENDER GIAO DIỆN "VOYAGER STYLE" // ==========================================================

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 font-sans relative"
      style={{
        backgroundImage: `url(${BgFullPage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/10 z-0"></div>{" "}
      {/* Card chính */}{" "}
      <Card className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl border-0 bg-white min-h-[600px]">
        {/* --- CỘT TRÁI: BANNER --- */}{" "}
        <div
          className="relative hidden md:block h-full bg-cover bg-center rounded-l-3xl p-8 transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${bannerImages[currentBannerIndex]})`,
          }}
        >
          {" "}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-l-3xl"></div>{" "}
          <div className="relative z-10 flex flex-col justify-end h-full text-white">
            {" "}
            <div className="flex items-end gap-4 mt-auto">
              {" "}
              <img
                src={AvatarAndrew}
                alt="Avatar"
                className="w-12 h-12 rounded-full border-2 border-white shadow-lg object-cover"
              />{" "}
              <div>
                <p className="font-bold text-lg">ParkingM</p>{" "}
                <p className="text-sm text-gray-300">
                  Hệ thống xác thực bảo mật{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>
        {/* --- CỘT PHẢI: TRẠNG THÁI XÁC THỰC --- */}{" "}
        <div className="flex flex-col justify-center items-center p-8 md:p-12 text-center h-full">
          {/* Logo nhỏ */}{" "}
          <div className="flex items-center gap-2 mb-8 absolute top-8 right-8 md:static md:mb-12">
            {" "}
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
              {" "}
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />{" "}
            </svg>{" "}
            <span className="text-lg font-bold text-gray-800">ParkingM</span>{" "}
          </div>
          {/* KHU VỰC HIỂN THỊ TRẠNG THÁI */}{" "}
          <div className="flex flex-col items-center space-y-6 max-w-sm w-full">
            {/* 1. Trạng thái đang tải */}{" "}
            {loading && (
              <div className="flex flex-col items-center animate-pulse">
                {" "}
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  {" "}
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />{" "}
                </div>{" "}
                <h2 className="text-2xl font-bold text-gray-900">
                  Đang xử lý...{" "}
                </h2>{" "}
                <p className="text-gray-500">Vui lòng đợi trong giây lát.</p>{" "}
              </div>
            )}
            {/* 2. Trạng thái Hoàn thành (Có kết quả) */}{" "}
            {!loading && (
              <>
                {" "}
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 ${
                    isError ? "bg-red-50" : "bg-green-50"
                  }`}
                >
                  {" "}
                  {isError ? (
                    <XCircle className="w-12 h-12 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  )}{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h2
                    className={`text-2xl font-bold mb-2 ${
                      isError ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {" "}
                    {isError ? "Xác thực thất bại" : "Thành công!"}{" "}
                  </h2>{" "}
                  <p className="text-gray-600 font-medium px-4">{message}</p>{" "}
                </div>
                {/* Nút quay về Login */}{" "}
                <Button
                  onClick={handleNavigateToLogin}
                  className={`w-full h-12 rounded-xl text-lg font-bold shadow-md mt-6 transition-all ${
                    isError
                      ? "bg-gray-800 hover:bg-gray-900 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white shadow-green-200"
                  }`}
                >
                  {" "}
                  {isError ? "Quay lại Đăng nhập" : "Đăng nhập ngay"}{" "}
                </Button>{" "}
              </>
            )}{" "}
          </div>
          {/* Footer trang trí */}{" "}
          <div className="mt-auto text-sm text-gray-400 pt-12">
            &copy; 2024 ParkingM System. All rights reserved.{" "}
          </div>{" "}
        </div>{" "}
      </Card>{" "}
    </div>
  );
}

export default VerifyEmailPage;
