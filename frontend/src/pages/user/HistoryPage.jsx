// frontend/src/pages/user/HistoryPage.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Gift, Car, CreditCard, Clock, CheckCircle } from "lucide-react"; // Import Lucide Icons

// --- HÀM HELPER ĐỂ HIỂN THỊ ICON VÀ MÀU SẮC MỚI ---
const getTypeDisplay = (type) => {
  switch (type) {
    // Tông màu mới, đồng nhất với Profile
    case "PAYMENT": // Mua gói/Thanh toán
      return {
        title: "Thanh toán giao dịch",
        icon: CreditCard,
        accent: "bg-violet-100 text-violet-700",
        color: "violet-500",
        shadow: "shadow-violet-200",
      };
    case "PROMOTION": // Nhận Voucher
      return {
        title: "Bạn nhận được quà tặng!",
        icon: Gift,
        accent: "bg-amber-100 text-amber-700",
        color: "amber-500",
        shadow: "shadow-amber-200",
      };
    case "PARKING": // Check-out đỗ xe
      return {
        title: "Thanh toán đỗ xe thành công",
        icon: Car,
        accent: "bg-cyan-100 text-cyan-700",
        color: "cyan-500",
        shadow: "shadow-cyan-200",
      };
    default:
      return {
        title: "Thông báo hệ thống",
        icon: CheckCircle,
        accent: "bg-gray-100 text-gray-700",
        color: "gray-500",
        shadow: "shadow-gray-200",
      };
  }
};

// Giả định bạn có Card component cơ bản:
const Card = ({ children, className = "" }) => (
  <div className={`bg-white ${className}`}>{children}</div>
);

const HistoryPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/notifications");
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử:", err);
      setError("Không thể tải lịch sử/thông báo.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm đánh dấu đã đọc (Giữ nguyên logic cũ)
  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Không thể đánh dấu đã đọc:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // --- HIỂN THỊ TRẠNG THÁI LOADING/ERROR ---
  if (loading) {
    return <div className="p-6 text-center">Đang tải lịch sử...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500 text-center">{error}</div>;
  }
  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        Không có lịch sử hoạt động nào.
      </div>
    );
  }

  // --- RENDERING DANH SÁCH LỊCH SỬ ---
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3">
        <Clock size={30} className="text-indigo-600" /> Lịch Sử Hoạt Động
      </h2>
      <div className="space-y-6">
        {notifications.map((notif) => {
          const {
            title,
            icon: Icon,
            accent,
            color,
            shadow,
          } = getTypeDisplay(notif.type);
          const timeAgo = formatDistanceToNow(parseISO(notif.createdAt), {
            addSuffix: true,
            locale: vi,
          });
          const isNew = !notif.isRead;

          return (
            <Card
              key={notif._id}
              className={`
                p-6 rounded-2xl border-4 relative overflow-hidden transition-all duration-300
                bg-white border-${color}
                ${
                  isNew
                    ? `shadow-xl shadow-${shadow} cursor-pointer` // Thẻ MỚI: viền 4px, shadow nổi bật
                    : `shadow-md border-opacity-50 cursor-default` // Thẻ ĐÃ XEM: viền 4px, shadow nhẹ, viền hơi mờ
                }
              `}
              onClick={() => isNew && markAsRead(notif._id)}
            >
              {/* Icon lớn (Opacity thấp) */}
              <div className={`absolute top-0 right-0 p-6 opacity-10`}>
                <Icon size={96} className={`text-${color}`} />
              </div>

              <div className="flex items-start justify-between relative z-10">
                {/* Nội dung chính */}
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${accent} flex-shrink-0`}>
                    <Icon size={20} className={`text-${color}`} />
                  </div>
                  <div className="max-w-[80%]">
                    <p className={`font-extrabold text-lg text-${color}`}>
                      {title}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {/* Thời gian và Badge */}
                <div className="text-right flex flex-col items-end space-y-1 flex-shrink-0">
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {timeAgo}
                  </span>
                  {isNew && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-md`}
                    >
                      MỚI
                    </span>
                  )}
                </div>
              </div>

              {/* Dòng thời gian chi tiết */}
              <div className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
                <span className="font-semibold">Thời gian:</span>{" "}
                {format(parseISO(notif.createdAt), "dd/MM/yyyy HH:mm:ss", {
                  locale: vi,
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryPage;
