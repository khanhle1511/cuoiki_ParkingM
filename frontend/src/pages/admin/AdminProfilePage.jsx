import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  User,
  Settings,
  Wallet,
  Mail,
  Edit3,
  Lock,
  Package,
  Ticket,
  Users,
  X,
  Loader2,
  Search,
  History,
} from "lucide-react";

// --- COMPONENTS UI NHỎ (Tái sử dụng) ---
const Card = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white shadow-xl rounded-2xl border border-gray-100 transition-all hover:shadow-2xl ${
      onClick ? "cursor-pointer hover:scale-[1.02]" : ""
    } ${className}`}
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

// --- MODAL: DANH SÁCH NGƯỜI SỞ HỮU ---
const OwnersModal = ({ isOpen, onClose, type, item }) => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen && item) {
      setLoading(true);
      // Gọi API lấy danh sách sở hữu
      axios
        .get(`/api/admin/owners/${type}/${item._id}`)
        .then((res) => setOwners(res.data.owners))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setOwners([]);
    }
  }, [isOpen, item, type]);

  if (!isOpen) return null;

  const filteredOwners = owners.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold flex gap-2">
            <Users className="text-teal-600" /> Danh sách sở hữu:{" "}
            {item.planName || item.name || item.code}
          </h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="p-4 border-b bg-gray-50">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="animate-spin inline" /> Đang tải...
            </div>
          ) : filteredOwners.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              Chưa có ai sở hữu.
            </p>
          ) : (
            filteredOwners.map((owner) => (
              <div
                key={owner._id}
                className="flex justify-between items-center p-3 border-b hover:bg-gray-50"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700">
                    {owner.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold">{owner.name}</p>
                    <p className="text-xs text-gray-500">{owner.email}</p>
                  </div>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {owner.detail}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH: ADMIN PROFILE ---
const AdminProfilePage = () => {
  const { user } = useAuth();

  // State quản lý Tab
  const [activeTab, setActiveTab] = useState("overview");

  // State dữ liệu
  const [data, setData] = useState(null); // Dữ liệu profile admin
  const [adminPlans, setAdminPlans] = useState([]);
  const [adminVouchers, setAdminVouchers] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]); // Log xe toàn hệ thống
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState("plan");
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State (Update Info/Pass)
  const [formData, setFormData] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updating, setUpdating] = useState(false);

  // Notification State
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

  // --- HÀM GỌI API LOG XE (Định nghĩa trong component để dùng state) ---
  const fetchAdminLogs = async () => {
    try {
      console.log("➡️ Đang gọi API Log Admin...");
      const logsRes = await axios.get("/api/admin/logs/all");
      console.log("✅ Log Admin tải xong, số lượng:", logsRes.data.length);
      setAdminLogs(logsRes.data);
    } catch (error) {
      console.error(
        "❌ LỖI TẢI LOG ADMIN:",
        error.response || error.message || error
      );
      // Không hiện thông báo lỗi ngay lập tức để tránh spam nếu backend chưa sẵn sàng
    }
  };

  // --- USE EFFECT CHÍNH: TẢI DỮ LIỆU BAN ĐẦU ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Tải các dữ liệu cơ bản trước (Profile, Pricing, Voucher)
        const [profileRes, plansRes, vouchersRes] = await Promise.all([
          axios.get("/api/users/profile/full"),
          axios.get("/api/pricing"),
          axios.get("/api/admin/vouchers"),
        ]);

        setData(profileRes.data);
        setFormData((prev) => ({ ...prev, name: profileRes.data.user.name }));

        // Lọc gói (Loại bỏ Hourly Rate)
        const realPlans = plansRes.data.filter(
          (p) => p.planName || (p.name && !p.name.includes("Hourly Rate"))
        );
        setAdminPlans(realPlans);
        setAdminVouchers(vouchersRes.data);

        // 2. Tải Log xe (Gọi hàm riêng để tách biệt lỗi)
        await fetchAdminLogs();
      } catch (error) {
        console.error("Lỗi tải dữ liệu Admin Profile:", error);
        showNotification("Không thể tải dữ liệu trang Admin.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- XỬ LÝ SỰ KIỆN ---
  const handleAdminItemClick = (type, item) => {
    setSelectedItemType(type);
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.put("/api/users/profile/update-info", {
        name: formData.name,
      });
      showNotification("Cập nhật thành công", "success");
      setData((prev) => ({
        ...prev,
        user: { ...prev.user, name: formData.name },
      }));
    } catch (err) {
      showNotification(
        "Lỗi cập nhật: " + (err.response?.data?.message || err.message),
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword)
      return showNotification("Mật khẩu mới không khớp!", "error");

    setUpdating(true);
    try {
      await axios.put("/api/users/profile/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      showNotification("Đổi mật khẩu thành công!", "success");

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      showNotification("Mật khẩu cũ không đúng.", "error");
    } finally {
      setUpdating(false);
    }
  };

  // --- LOGIC TÍNH GIÁ TIỀN HIỂN THỊ TRONG BẢNG LOG ---
  const calculateFeeDisplay = (log) => {
    const isParked = log.status === "IN_PARK" || log.status === "parked";

    // Trường hợp 1: Đã trả xe -> Hiển thị totalAmount từ DB
    if (!isParked) {
      return `${(log.totalAmount || 0).toLocaleString()} đ`;
    }

    // Trường hợp 2: Đang đỗ -> Tính giá tạm tính
    const checkInTime = new Date(log.checkInTime);
    const currentTime = new Date();
    // Tính chênh lệch giờ (làm tròn xuống)
    const diffHours = Math.floor(
      (currentTime - checkInTime) / (1000 * 60 * 60)
    );
    // Tính phút lẻ
    const diffMinutes = Math.ceil(
      ((currentTime - checkInTime) % (1000 * 60 * 60)) / (1000 * 60)
    );

    let timeDisplay = `${diffHours}h ${diffMinutes}p`;

    // Giả định giá vé lượt (Ví dụ 5000đ/h).
    // Để chính xác hơn, bạn có thể lấy giá từ API pricing nếu muốn.
    const baseHourlyRate = 5000;
    const estimatedFee =
      diffHours > 0 ? diffHours * baseHourlyRate : baseHourlyRate;

    return (
      <div className="text-right">
        <span className="font-bold text-orange-600">
          ~{estimatedFee.toLocaleString()} đ
        </span>
        <p className="text-xs text-gray-500">{timeDisplay}</p>
      </div>
    );
  };

  // --- RENDER ---
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-800" size={48} />
      </div>
    );

  if (!data)
    return (
      <div className="p-10 text-center text-gray-500">
        Không có dữ liệu hiển thị.
      </div>
    );

  // Component nút chuyển Tab
  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
        activeTab === id
          ? "bg-slate-800 text-white shadow-md"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Modal và Notification giữ nguyên */}
      <OwnersModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={selectedItemType}
        item={selectedItem}
      />
      {notification.visible && (
        <div
          className={`fixed top-5 right-5 ${
            notification.type === "success" ? "bg-teal-500" : "bg-red-500"
          } text-white px-6 py-3 rounded shadow-xl z-50`}
        >
          {notification.message}
        </div>
      )}

      {/* HEADER ADMIN (Được làm lại theo phong cách mới) */}
      <div className="relative pt-12">
        {/* Background Gradient mô phỏng */}
        <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-r from-teal-500 to-green-500 z-0"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Card className="p-6 pt-10 shadow-2xl">
            <div className="flex items-center gap-6">
              {/* Vòng tròn Avatar/Admin Badge */}
              <div className="relative w-20 h-20">
                <div className="w-full h-full rounded-full bg-white border-2 border-green-500 flex items-center justify-center text-3xl font-bold text-green-500 shadow-inner">
                  {user.name?.charAt(0) || "A"}
                </div>
                {/* Chấm tròn nhỏ (Mô phỏng "Verified" hoặc Status) */}
                <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              {/* Thông tin Admin */}
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  {data.user.name} ({data.user.email})
                </p>
                <div className="flex gap-2 items-center mt-1">
                  {/* Badge "Admin" */}
                  <Badge color="blue">{user.role}</Badge>
                  {/* Badge "Đã xác thực" */}
                  <Badge color="green">Đã xác thực</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* NAVIGATION (Tab Bar) - Thiết kế lại để phù hợp với UI mới */}
          <div className="flex gap-2 w-fit mt-4">
            <TabButton id="overview" label="Tổng quan" icon={User} />
            <TabButton
              id="management"
              label="Quản lý Gói/Voucher"
              icon={Wallet}
            />
            <TabButton id="all-history" label="Lịch sử đỗ xe" icon={History} />
            <TabButton id="settings" label="Cài đặt" icon={Settings} />
          </div>
        </div>
      </div>
      {/* END HEADER ADMIN */}

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* 1. TAB TỔNG QUAN (Áp dụng UI Card mới) */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-3 gap-6">
            {/* Card 1: Tổng Chi tiêu (Mô phỏng) */}
            <Card className="p-6 flex items-center justify-between border-l-4 border-teal-500">
              <div>
                <h3 className="text-gray-500">Gói đang bán</h3>
                {/* Giả định số lượng lớn để mô phỏng "Tổng chi tiêu" */}
                <p className="text-4xl font-extrabold text-slate-900 mt-1">
                  {adminPlans.length}
                </p>
              </div>
              <Package size={32} className="text-teal-400 opacity-70" />
            </Card>

            {/* Card 2: Lượt đỗ xe */}
            <Card className="p-6 flex items-center justify-between border-l-4 border-green-500">
              <div>
                <h3 className="text-gray-500">Voucher hệ thống</h3>
                <p className="text-4xl font-extrabold text-slate-900 mt-1">
                  {adminVouchers.length}
                </p>
              </div>
              <Ticket size={32} className="text-green-400 opacity-70" />
            </Card>

            {/* Card 3: Trạng thái (UI viền tím) */}
            <Card className="p-6 flex items-center justify-between border-2 border-purple-400 shadow-lg bg-purple-50/50">
              <div>
                <h3 className="text-gray-500">Tổng lượt đỗ</h3>
                <p className="text-4xl font-extrabold text-purple-600 mt-1">
                  {adminLogs.length}
                </p>
              </div>
              <History size={32} className="text-purple-400 opacity-70" />
            </Card>
          </div>
        )}

        {/* 2. TAB QUẢN LÝ GÓI/VOUCHER (Không thay đổi UI nhiều để giữ tính năng) */}
        {activeTab === "management" && (
          <div className="space-y-8">
            {/* ... (Giữ nguyên UI Packages và Vouchers hiện tại) ... */}
            {/* ... */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex gap-2">
                <Package className="text-teal-600" /> Gói Dịch Vụ
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {adminPlans.map((plan) => (
                  <Card
                    key={plan._id}
                    onClick={() => handleAdminItemClick("plan", plan)}
                    className="p-5 cursor-pointer hover:border-teal-500 group"
                  >
                    <h4 className="font-bold text-lg group-hover:text-teal-600">
                      {plan.planName || plan.name}
                    </h4>
                    <p className="text-2xl font-extrabold text-teal-600">
                      {(plan.price || 0).toLocaleString()} đ
                    </p>
                    <p className="text-xs text-gray-400 mt-2 text-center uppercase font-bold">
                      Click xem người mua
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 flex gap-2">
                <Ticket className="text-orange-600" /> Voucher Hệ Thống
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {adminVouchers.map((v) => (
                  <Card
                    key={v._id}
                    onClick={() => handleAdminItemClick("voucher", v)}
                    className="p-5 bg-orange-50 cursor-pointer hover:border-orange-500 group"
                  >
                    <div className="flex justify-between">
                      <span className="font-mono font-bold text-orange-600 text-xl">
                        {v.code}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          v.isActive
                            ? "bg-green-200 text-green-800"
                            : "bg-gray-200"
                        }`}
                      >
                        {v.isActive ? "Active" : "Paused"}
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      Đã dùng: {v.usedCount}/{v.usageLimit}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 text-center uppercase font-bold">
                      Click xem người sở hữu
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. TAB LỊCH SỬ ĐỖ XE TOÀN HỆ THỐNG (Giữ nguyên UI) */}
        {activeTab === "all-history" && (
          <Card className="overflow-hidden border-0 shadow-xl">
            {/* ... (Giữ nguyên Table UI) ... */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-800 text-white uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Thời gian vào</th>
                    <th className="px-6 py-4">Biển số</th>
                    <th className="px-6 py-4">Vị trí</th>
                    <th className="px-6 py-4">Người đỗ</th>
                    <th className="px-6 py-4 text-right">Chi phí</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {adminLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-gray-400 italic"
                      >
                        Chưa có lịch sử đỗ xe nào trong hệ thống.
                      </td>
                    </tr>
                  ) : (
                    adminLogs.map((log) => {
                      const isParked =
                        log.status === "IN_PARK" || log.status === "parked";
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
                          <td className="px-6 py-4 text-gray-700">
                            <p className="font-medium">
                              {log.user?.name || log.user?.email || "N/A"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {log.user?.role}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-teal-600">
                            {calculateFeeDisplay(log)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge color={isParked ? "blue" : "gray"}>
                              {isParked ? "Đang đỗ" : "Đã trả"}
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

        {/* 4. TAB CÀI ĐẶT (Giữ nguyên UI) */}
        {activeTab === "settings" && (
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* ... (Giữ nguyên UI form Cập nhật thông tin và Đổi mật khẩu) ... */}
            <Card className="p-8">
              <h3 className="text-xl font-bold mb-6 text-gray-800">
                Cập nhật thông tin cơ bản
              </h3>
              <form onSubmit={handleUpdateInfo} className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border p-3 rounded-lg focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="Tên hiển thị"
                />
                <label className="block text-sm font-semibold text-gray-700 pt-2">
                  Email
                </label>
                <input
                  type="email"
                  value={data.user.email}
                  disabled
                  className="w-full border p-3 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <button
                  disabled={updating}
                  className="w-full bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-900 transition-all disabled:opacity-50 font-bold mt-4"
                >
                  {updating ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </form>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-bold mb-6 text-gray-800">
                Đổi mật khẩu
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
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
                  className="w-full border p-3 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none"
                  required
                />

                <label className="block text-sm font-semibold text-gray-700 pt-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="w-full border p-3 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none"
                  required
                />

                <label className="block text-sm font-semibold text-gray-700 pt-2">
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
                  className="w-full border p-3 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none"
                  required
                />

                <button
                  disabled={updating}
                  className="w-full bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition-all disabled:opacity-50 font-bold mt-4"
                >
                  {updating ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminProfilePage;
