import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "/src/context/AuthContext.jsx";
import PaymentConfirmationModal from "@/components/common/PaymentConfirmationModal"; // Đảm bảo đường dẫn này đúng

const VEHICLE_ICONS = {
  Car: "🚗",
  Motorbike: "🏍️",
  Bicycle: "🚲",
};

const formatCurrency = (amount) => {
  return amount ? amount.toLocaleString("vi-VN") + " VNĐ" : "Liên hệ";
};
const API_PURCHASE = "/api/subscriptions/purchase"; // API POST mua gói

function SubscriptionPage() {
  const { token, user } = useAuth();
  // ⭐ LƯU TRỮ ID GÓI ĐANG HOẠT ĐỘNG
  const [activePackageIds, setActivePackageIds] = useState(new Set());
  const [subscriptionList, setSubscriptionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseStatus, setPurchaseStatus] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ==========================================================
  // 1. Fetch dữ liệu gói đăng ký VÀ GÓI ĐANG HOẠT ĐỘNG
  // ==========================================================
  const fetchSubscriptionData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch TẤT CẢ các gói đang bán
      const packagesRes = await axios.get("/api/pricing/subscriptions");

      // 2. Fetch CÁC GÓI ĐANG HOẠT ĐỘNG của User
      const activeSubsRes = await axios.get("/api/subscriptions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Lọc ra các ID gói giá (Pricing ID) mà User đang sở hữu
      const ownedIds = new Set();
      activeSubsRes.data.forEach((sub) => {
        // Lấy ID của gói giá từ đối tượng Subscription đã populated
        if (sub.pricing && sub.pricing._id) {
          ownedIds.add(sub.pricing._id);
        } else if (sub.pricing && typeof sub.pricing === "string") {
          // Trường hợp chưa populate, pricing là ID string
          ownedIds.add(sub.pricing);
        }
      });

      setSubscriptionList(
        packagesRes.data.sort((a, b) => a.durationValue - b.durationValue)
      );
      setActivePackageIds(ownedIds); // ⭐ LƯU CÁC ID GÓI ĐÃ MUA
    } catch (err) {
      // Nếu lỗi 401 (chưa đăng nhập), vẫn hiển thị list gói nhưng activeIds sẽ là Set rỗng
      if (err.response?.status === 401) {
        // Chỉ cần fetch list gói công khai
        const packagesRes = await axios.get("/api/pricing/subscriptions");
        setSubscriptionList(packagesRes.data);
        setActivePackageIds(new Set()); // Coi như chưa sở hữu gì
      } else {
        setError(
          err.response?.data?.message || "Lỗi khi tải danh sách gói dịch vụ."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [token]); // ⭐ Thêm token vào dependency để fetch lại khi đăng nhập

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  // ==========================================================
  // 2. Xử lý Mua gói (BƯỚC 1: Mở Modal)
  // ==========================================================
  const handlePurchase = (sub) => {
    // Ngăn chặn mở modal nếu gói đã được mua
    if (activePackageIds.has(sub._id)) return;

    if (!user || !token) {
      setPurchaseStatus("Vui lòng đăng nhập để mua gói.");
      return;
    }

    setSelectedPackage(sub);
    setPurchaseStatus(null);
  };

  // ==========================================================
  // 3. Hàm Thanh toán Cuối cùng (BƯỚC 2: Gửi POST)
  // ==========================================================
  const handleFinalPayment = async (subscriptionId) => {
    setIsProcessing(true);
    setPurchaseStatus(`Đang xử lý thanh toán cho gói ID: ${subscriptionId}...`);

    try {
      if (!selectedPackage) {
        throw new Error("Không tìm thấy gói để thanh toán.");
      }

      const res = await axios.post(
        API_PURCHASE,
        {
          subscriptionId: selectedPackage._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPurchaseStatus(`✅ ${res.data.message || "Mua gói thành công!"}`);
      setSelectedPackage(null);

      // ⭐ LÀM MỚI DỮ LIỆU SAU KHI MUA THÀNH CÔNG
      fetchSubscriptionData();
    } catch (err) {
      setPurchaseStatus(
        `❌ Lỗi mua gói: ${err.response?.data?.message || "Lỗi không xác định"}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================================
  // 4. Render giao diện
  // ==========================================================
  if (loading) {
    return <div className="p-6 text-center">Đang tải gói dịch vụ...</div>;
  }

  return (
    <div className="subscription-page-container p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        🎫 Gói Dịch Vụ Đỗ Xe
      </h1>
      <p className="mb-6 text-gray-600">
        Chọn gói đăng ký phù hợp nhất với nhu cầu của bạn để tiết kiệm chi phí
        đỗ xe.
      </p>

      {/* HIỂN THỊ THÔNG BÁO LỖI/TRẠNG THÁI */}
      {error && (
        <div className="error-alert mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
          {error}
        </div>
      )}
      {purchaseStatus && (
        <div
          className={`mb-4 p-3 rounded ${
            purchaseStatus.includes("✅")
              ? "bg-green-100 text-green-700"
              : purchaseStatus.includes("❌")
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {purchaseStatus}
        </div>
      )}

      {/* DANH SÁCH GÓI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptionList.map((sub) => {
          // ⭐ LOGIC MỚI: Kiểm tra gói này đã được mua chưa
          const isOwned = activePackageIds.has(sub._id);
          const buttonColorClass =
            sub.rateType === "Monthly"
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-green-500 text-white hover:bg-green-600";

          return (
            <div
              key={sub._id}
              className={`subscription-card p-6 rounded-xl shadow-lg border-2 relative ${
                isOwned
                  ? "border-green-500 bg-green-50" // Gói đã mua
                  : sub.rateType === "Monthly"
                  ? "border-indigo-600 bg-indigo-50" // Gói Monthly
                  : "border-gray-200 bg-white" // Gói thường
              } hover:shadow-xl transition duration-300`}
            >
              {/* Badge Đã mua */}
              {isOwned && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white shadow-md">
                    ĐANG HOẠT ĐỘNG
                  </span>
                </div>
              )}

              <div className="text-4xl mb-4">
                {VEHICLE_ICONS[sub.vehicleType]}
              </div>

              {/* Tên Gói */}
              <h2
                className={`text-xl font-bold mb-2 ${
                  sub.rateType === "Monthly"
                    ? "text-indigo-700"
                    : "text-gray-800"
                }`}
              >
                {sub.name}
              </h2>

              {/* Giá Tiền */}
              <p className="text-4xl font-extrabold text-green-600 mb-2">
                {formatCurrency(sub.rate)}
              </p>

              {/* Thời Hạn */}
              <p className="text-sm text-gray-500 mb-4">
                Thời hạn:
                <span className="font-semibold text-gray-700 ml-1">
                  {sub.durationValue}{" "}
                  {sub.rateType
                    .replace("Monthly", "tháng")
                    .replace("Daily", "ngày")
                    .replace("HalfMonthly", "nửa tháng")}
                </span>
              </p>

              {/* Mô tả */}
              <p className="text-gray-600 text-sm mb-6">
                {sub.description ||
                  `Vé ${sub.durationValue} ${sub.rateType} dành cho xe ${sub.vehicleType}.`}
              </p>

              {/* NÚT MUA HÀNG */}
              <button
                onClick={() => handlePurchase(sub)}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  isOwned
                    ? "bg-gray-400 text-white cursor-not-allowed" // Nếu đã mua
                    : buttonColorClass // Màu sắc bình thường
                }`}
                disabled={isOwned || loading || isProcessing} // ⭐ Disabled nếu đã sở hữu, đang tải, hoặc đang xử lý
              >
                {loading || isProcessing
                  ? "Đang xử lý..."
                  : isOwned
                  ? "ĐÃ SỞ HỮU GÓI NÀY" // ⭐ Text khi đã mua
                  : `Mua ngay - ${formatCurrency(sub.rate)}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal Xác nhận Thanh toán */}
      {selectedPackage && (
        <PaymentConfirmationModal
          pkg={selectedPackage}
          onClose={() => setSelectedPackage(null)}
          onConfirmPayment={handleFinalPayment}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}

export default SubscriptionPage;
