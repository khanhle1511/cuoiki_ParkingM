import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
// Dùng đường dẫn tương đối để đảm bảo chạy được mọi trường hợp

import {
  Loader2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MapPin,
  Car,
  Bike,
  CircleAlert,
} from "lucide-react";

// === COMPONENT CON: Bảng Lịch sử ===
const HistoryTable = ({ history, filterType }) => {
  if (!history || history.length === 0) {
    return (
      <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded border border-dashed text-center">
        Không có lịch sử để hiển thị.
      </p>
    );
  }

  const filteredHistory = history.filter(
    (log) => log.vehicleType === filterType
  );

  if (filteredHistory.length === 0) {
    return (
      <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded border border-dashed text-center">
        Không có lượt đỗ xe nào cho loại xe này.
      </p>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  const formatCurrency = (amount) => {
    if (!amount) return "0 đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  return (
    <div className="overflow-x-auto mt-2 border rounded-md shadow-sm">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr>
            <th className="px-4 py-2">Biển số</th>
            <th className="px-4 py-2">Check In</th>
            <th className="px-4 py-2">Check Out</th>
            <th className="px-4 py-2 text-right">Số tiền</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredHistory.map((log) => (
            <tr key={log._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2 font-medium text-gray-900">
                {log.licensePlate || "N/A"}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {formatDate(log.checkInTime)}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {formatDate(log.checkOutTime)}
              </td>
              <td className="px-4 py-2 text-right font-bold text-indigo-600">
                {formatCurrency(log.totalAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// === COMPONENT CHÍNH ===
const UserDetailPage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleHistoryType, setVisibleHistoryType] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/admin/users/user/${userId}`);

        // 🟢 DEBUG: Bạn hãy F12 xem dòng này.
        // Nếu activeLog là null thì lỗi do Database đang lưu status khác chữ "parked"
        console.log("👉 ACTIVE LOG TỪ SERVER:", response.data.activeLog);

        setUser(response.data);
      } catch (err) {
        console.error("Lỗi tải user:", err);
        setError(err.response?.data?.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-600 font-bold bg-red-50 rounded-lg mx-8 mt-8">
        {error}
      </div>
    );
  if (!user)
    return (
      <div className="p-8 text-center text-gray-500">
        Không tìm thấy người dùng.
      </div>
    );

  const stats = user.parkingStats || {
    totalCar: 0,
    totalMotorbike: 0,
    totalBicycle: 0,
  };
  const history = user.parkingHistory || [];

  const toggleHistory = (type) => {
    setVisibleHistoryType(visibleHistoryType === type ? null : type);
  };

  const StatRow = ({ type, label, count, icon }) => (
    <div className="border-b last:border-0">
      <button
        onClick={() => toggleHistory(type)}
        className={`flex justify-between items-center w-full py-3 px-3 text-left rounded transition-all duration-200 ${
          count > 0
            ? "hover:bg-indigo-50 cursor-pointer"
            : "opacity-50 cursor-default"
        }`}
        disabled={count === 0}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${
              count > 0
                ? "bg-white border border-indigo-100 text-indigo-600"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {icon}
          </div>
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">{count} lượt</span>
          {count > 0 &&
            (visibleHistoryType === type ? (
              <ChevronUp size={16} className="text-indigo-600" />
            ) : (
              <ChevronDown size={16} className="text-gray-400" />
            ))}
        </div>
      </button>
      {visibleHistoryType === type && (
        <div className="px-2 pb-3 animate-in slide-in-from-top-2 duration-300">
          <HistoryTable history={history} filterType={type} />
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Link
          to="/dashboard/users"
          className="inline-flex items-center text-gray-500 hover:text-indigo-600 transition group"
        >
          <ArrowLeft
            size={20}
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          />
          Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT 1: THÔNG TIN (Chiếm 5 phần) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
              <CircleAlert size={18} className="text-blue-500" />
              Thông tin Đăng ký
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Username</span>
                <span className="font-medium text-gray-900">
                  {user.username}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900">{user.email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">SĐT</span>
                <span className="font-medium text-gray-900">
                  {user.mobile || "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Vai trò</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold border ${
                    user.role === "Admin"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Trạng thái</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold border ${
                    user.isVerified
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }`}
                >
                  {user.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                </span>
              </div>
              <div className="pt-3 mt-2 border-t border-dashed">
                <span className="block text-gray-500 mb-1.5 font-medium">
                  Ghi chú (Admin):
                </span>
                <div className="bg-gray-50 p-3 rounded border text-gray-600 italic text-sm min-h-[80px]">
                  {user.notes || "Không có ghi chú nào."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT 2: TRẠNG THÁI & THỐNG KÊ (Chiếm 7 phần) */}
        <div className="lg:col-span-7 space-y-6">
          {/* TRẠNG THÁI HIỆN TẠI */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-green-600" /> Trạng thái Hiện
              tại
            </h2>

            {/* Logic hiển thị Active Log */}
            {user.activeLog ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5 relative overflow-hidden">
                {/* Hiệu ứng chấm xanh nhấp nháy */}
                <div className="absolute top-4 right-4">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>

                <div className="mb-4">
                  <span className="bg-white border border-green-200 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide shadow-sm">
                    Đang đỗ xe
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Phương tiện
                    </p>
                    <p className="font-bold text-gray-900 capitalize flex items-center gap-2 text-lg mt-0.5">
                      {user.activeLog.vehicleType === "car" ? (
                        <Car size={20} className="text-indigo-600" />
                      ) : (
                        <Bike size={20} className="text-indigo-600" />
                      )}
                      {user.activeLog.vehicleType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Biển số xe
                    </p>
                    <p className="font-bold text-gray-900 text-lg mt-0.5 font-mono tracking-wide">
                      {user.activeLog.licensePlate}
                    </p>
                  </div>
                  <div className="sm:col-span-2 bg-white/60 p-3 rounded border border-green-100 mt-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500 uppercase font-semibold">
                        Vị trí đỗ
                      </span>
                      <span className="text-xs text-gray-500 uppercase font-semibold">
                        Thời gian vào
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-600 text-lg">
                        {user.activeLog.parkingSlot?.name || "Khu vực chung"}
                      </span>
                      <span className="font-medium text-gray-900">
                        {user.activeLog.checkInTime
                          ? new Date(user.activeLog.checkInTime).toLocaleString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                              }
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center flex flex-col items-center justify-center gap-2">
                <div className="p-3 bg-gray-100 rounded-full text-gray-400 mb-1">
                  <Car size={24} />
                </div>
                <p className="text-gray-500 font-medium">
                  Hiện không có xe nào trong bãi.
                </p>
                <p className="text-xs text-gray-400">
                  (Nếu xe đang đỗ thực tế, vui lòng kiểm tra lại Trạng thái
                  trong Database)
                </p>
              </div>
            )}
          </div>

          {/* THỐNG KÊ */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-3 mb-2">
              Lịch sử Đỗ xe (Đã xong)
            </h2>
            <div className="divide-y divide-gray-100">
              <StatRow
                type="car"
                label="Ô tô"
                count={stats.totalCar}
                icon={<Car size={18} />}
              />
              <StatRow
                type="motorbike"
                label="Xe máy"
                count={stats.totalMotorbike}
                icon={<Bike size={18} />}
              />
              <StatRow
                type="bicycle"
                label="Xe đạp"
                count={stats.totalBicycle}
                icon={<Bike size={18} />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
