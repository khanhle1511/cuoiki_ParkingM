import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  User,
  CreditCard,
  History,
  Settings,
  Wallet,
  Car,
  Shield,
  Mail,
  Edit3,
  Lock,
  Ticket,
  Loader2,
  Icon,
} from "lucide-react";

// --- COMPONENTS UI NHỎ (Tái sử dụng) ---
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white shadow-xl rounded-2xl border border-gray-100 transition-all hover:shadow-2xl ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ children, color = "gray" }) => {
  const colors = {
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    yellow: "bg-orange-100 text-orange-700 border-orange-200",
    blue: "bg-sky-100 text-sky-700 border-sky-200",
    gray: "bg-slate-100 text-slate-700 border-slate-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${
        colors[color] || colors.gray
      }`}
    >
      {children}
    </span>
  );
};

const UserProfilePage = () => {
  const { user: authUser } = useAuth();

  // State quản lý Tab
  const [activeTab, setActiveTab] = useState("overview");

  // State dữ liệu
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // State Form (Cập nhật thông tin & Đổi mật khẩu)
  const [formData, setFormData] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State thông báo (Toast)
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const showNotification = (message, type = "info") => {
    setNotification({ visible: true, message, type });
    setTimeout(
      () => setNotification({ ...notification, visible: false }),
      3000
    );
  };

  // --- LẤY DỮ LIỆU TỪ API ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi API lấy toàn bộ thông tin hồ sơ User
        const res = await axios.get("/api/users/profile/full");
        setData(res.data);
        // Cập nhật form tên hiển thị ban đầu
        setFormData((prev) => ({ ...prev, name: res.data.user.name }));
      } catch (error) {
        console.error("Lỗi tải profile:", error);
        // showNotification("Không thể tải thông tin hồ sơ.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- XỬ LÝ CẬP NHẬT THÔNG TIN CƠ BẢN ---
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await axios.put("/api/users/profile/update-info", {
        name: formData.name,
      });
      showNotification("Cập nhật tên thành công!", "success");
      setData((prev) => ({
        ...prev,
        user: { ...prev.user, name: formData.name },
      }));
    } catch {
      showNotification("Lỗi cập nhật.", "error");
    } finally {
      setUpdating(false);
    }
  };

  // --- XỬ LÝ ĐỔI MẬT KHẨU ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword)
      return showNotification("Mật khẩu mới không khớp!", "error");

    try {
      setUpdating(true);
      await axios.put("/api/users/profile/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      showNotification("Đổi mật khẩu thành công!", "success");
      // Reset form mật khẩu
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch {
      showNotification("Mật khẩu cũ không đúng.", "error");
    } finally {
      setUpdating(false);
    }
  };

  // --- HIỂN THỊ LOADING HOẶC LỖI ---
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin text-teal-600" size={48} />
      </div>
    );

  if (!data)
    return (
      <div className="p-10 text-center text-gray-500">
        Không có dữ liệu hiển thị.
      </div>
    );

  // Destructuring dữ liệu để dùng cho gọn
  const { user, stats, subscriptions, vouchers, logs } = data;

  // Component nút chuyển Tab
  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
        activeTab === id
          ? "bg-teal-600 text-white shadow-lg shadow-teal-200 scale-105 ring-2 ring-teal-100 ring-offset-1"
          : "bg-white text-gray-600 hover:bg-gray-50 hover:text-teal-600 border border-gray-200"
      }`}
    >
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      {/* Notification Toast */}
      {notification.visible && (
        <div
          className={`fixed top-5 right-5 px-6 py-3 rounded-lg shadow-xl z-50 text-white font-medium animate-in slide-in-from-right duration-300 ${
            notification.type === "success" ? "bg-emerald-500" : "bg-rose-500"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="relative mb-24">
        <div className="h-56 w-full bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 rounded-b-[3rem] shadow-xl overflow-hidden">
          {/* Trang trí nền */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4">
          <div className="flex flex-col md:flex-row items-center bg-white p-6 rounded-3xl shadow-2xl border border-gray-100">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-teal-50 to-emerald-50 p-1 shadow-inner">
                <div className="h-full w-full rounded-full bg-white flex items-center justify-center border-4 border-teal-50 text-6xl font-black text-teal-600">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div
                className="absolute bottom-2 right-2 h-6 w-6 bg-emerald-500 border-4 border-white rounded-full"
                title="Online"
              ></div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-8 text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {user.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                <span className="flex items-center text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                  <Mail size={14} className="mr-2 text-teal-500" /> {user.email}
                </span>
                <Badge color="blue">{user.role}</Badge>
                {user.isVerified && <Badge color="green">Đã xác thực</Badge>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION & CONTENT */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 mt-8">
        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-3 pb-8 border-b border-gray-200/60">
          <TabButton id="overview" label="Tổng quan" icon={User} />
          <TabButton id="subscriptions" label="Gói & Voucher" icon={Wallet} />
          <TabButton id="history" label="Lịch sử đỗ xe" icon={History} />
          <TabButton id="settings" label="Cài đặt" icon={Settings} />
        </div>

        {/* Tab Content Area */}
        <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* 1. TAB TỔNG QUAN */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-b-4 border-cyan-500 bg-gradient-to-br from-white to-cyan-50/30">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 font-medium mb-1">
                      Tổng chi tiêu
                    </p>
                    <p className="text-3xl font-black text-gray-900">
                      {stats.totalSpending?.toLocaleString() || 0}{" "}
                      <span className="text-lg text-cyan-600 font-bold">đ</span>
                    </p>
                  </div>
                  <div className="p-3 bg-cyan-100 rounded-xl text-cyan-600">
                    <Wallet size={28} />
                  </div>
                </div>
              </Card>
              <Card className="p-6 border-b-4 border-emerald-500 bg-gradient-to-br from-white to-emerald-50/30">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 font-medium mb-1">Lượt đỗ xe</p>
                    <p className="text-3xl font-black text-gray-900">
                      {stats.parkingCount || 0}{" "}
                      <span className="text-lg text-emerald-600 font-bold">
                        lượt
                      </span>
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                    <Car size={28} />
                  </div>
                </div>
              </Card>
              <Card className="p-6 border-b-4 border-purple-500 bg-gradient-to-br from-white to-purple-50/30">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 font-medium mb-1">Trạng thái</p>
                    <p className="text-3xl font-black text-purple-700">
                      Active
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                    <Shield size={28} />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 2. TAB GÓI & VOUCHER */}
          {activeTab === "subscriptions" && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Cột Gói Đăng Ký */}
              <div className="space-y-4">
                <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                  <CreditCard className="text-teal-600" /> Gói của tôi
                </h3>
                {subscriptions.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400 bg-gray-50">
                    Bạn chưa đăng ký gói nào.
                  </div>
                ) : (
                  subscriptions.map((sub) => (
                    <Card
                      key={sub._id}
                      className="p-5 border-l-4 border-l-teal-500"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-800">
                            {sub.pricing?.name || "Gói dịch vụ"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Hết hạn:{" "}
                            {format(new Date(sub.endDate), "dd/MM/yyyy", {
                              locale: vi,
                            })}
                          </p>
                        </div>
                        <Badge color="green">Đang dùng</Badge>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Cột Voucher */}
              <div className="space-y-4">
                <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                  <Ticket className="text-orange-600" /> Voucher của tôi
                </h3>
                {vouchers.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400 bg-gray-50">
                    Ví voucher trống.
                  </div>
                ) : (
                  vouchers.map((uv) => (
                    <Card
                      key={uv._id}
                      className="p-5 bg-gradient-to-r from-orange-50 to-white border-orange-200"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-mono font-bold text-orange-600 text-lg">
                            {uv.voucher?.code}
                          </p>
                          <p className="text-xs text-gray-500">
                            {uv.voucher?.description}
                          </p>
                        </div>
                        <Badge color="yellow">{uv.status}</Badge>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 3. TAB LỊCH SỬ ĐỖ XE */}
          {activeTab === "history" && (
            <Card className="overflow-hidden border-0 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Thời gian</th>
                      <th className="px-6 py-4">Biển số</th>
                      <th className="px-6 py-4">Vị trí</th>
                      <th className="px-6 py-4 text-right">Chi phí</th>
                      <th className="px-6 py-4 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {logs.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-12 text-center text-gray-400 italic"
                        >
                          Chưa có lịch sử đỗ xe.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => {
                        // 🔥 DEBUG LOG: Kiểm tra dữ liệu từng dòng

                        return (
                          <tr
                            key={log._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 font-medium text-gray-700">
                              {format(
                                new Date(log.checkInTime),
                                "dd/MM/yyyy HH:mm",
                                { locale: vi }
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-700">
                                {log.licensePlate}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                              {log.parkingSlot?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-teal-600">
                              {log.totalAmount?.toLocaleString() || 0} đ
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Badge
                                color={
                                  log.status === "IN_PARK" ? "blue" : "gray"
                                }
                              >
                                {log.status === "IN_PARK"
                                  ? "Đang gửi"
                                  : "Đã trả"}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* 4. TAB CÀI ĐẶT */}
          {activeTab === "settings" && (
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="p-8">
                <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                  <div className="bg-teal-100 p-3 rounded-xl text-teal-600">
                    <Edit3 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      Thông tin cơ bản
                    </h3>
                    <p className="text-sm text-gray-500">
                      Cập nhật tên hiển thị của bạn
                    </p>
                  </div>
                </div>
                <form onSubmit={handleUpdateInfo} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Tên hiển thị
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="text"
                      value={user.email}
                      disabled
                      className="w-full p-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <button
                    disabled={updating}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-teal-200 disabled:opacity-50"
                  >
                    {updating ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </form>
              </Card>
              <Card className="p-8">
                <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                  <div className="bg-rose-100 p-3 rounded-xl text-rose-600">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Bảo mật</h3>
                    <p className="text-sm text-gray-500">
                      Đổi mật khẩu đăng nhập
                    </p>
                  </div>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Nhập lại mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <button
                    disabled={updating}
                    className="w-full bg-white border-2 border-rose-500 text-rose-600 hover:bg-rose-50 font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                  >
                    {updating ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </button>
                </form>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
