import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Loader2, ArrowLeft, Save } from "lucide-react";

const UserEditPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  // Dùng để hiển thị placeholder
  const [originalUser, setOriginalUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State cho các trường trong form
  // Khởi tạo là 'undefined' để phân biệt "chưa thay đổi" và "xóa thành rỗng"
  const [name, setName] = useState(undefined);
  const [username, setUsername] = useState(undefined);
  const [email, setEmail] = useState(undefined);
  const [mobile, setMobile] = useState(undefined);
  const [password, setPassword] = useState(undefined);
  const [notes, setNotes] = useState(undefined); // 🚀 ĐÃ THÊM

  // 1. Tải thông tin người dùng hiện tại để làm placeholder
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/admin/users/user/${userId}`);
        setOriginalUser(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  // 2. Hàm xử lý khi bấm nút "Lưu"
  const handleSave = async (e) => {
    e.preventDefault();

    // Yêu cầu xác nhận
    if (!window.confirm("Bạn có chắc chắn muốn lưu các thay đổi này không?")) {
      return; // Hủy nếu user bấm "Cancel"
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    // Chỉ gộp những trường mà user thực sự đã nhập
    const updatedData = {};
    if (name !== undefined) updatedData.name = name;
    if (username !== undefined) updatedData.username = username;
    if (email !== undefined) updatedData.email = email;
    if (mobile !== undefined) updatedData.mobile = mobile; // Sửa lỗi SĐT
    if (notes !== undefined) updatedData.notes = notes; // 🚀 ĐÃ THÊM
    if (password) updatedData.password = password; // Mật khẩu chỉ gửi nếu có

    // Nếu user không thay đổi gì
    if (Object.keys(updatedData).length === 0) {
      setError("Bạn chưa nhập thông tin nào để thay đổi.");
      setLoading(false);
      return;
    }

    try {
      // Gửi request PATCH lên backend
      const response = await axios.patch(
        `/api/admin/users/user/${userId}`, // <--- Thêm chữ "/user" vào cho khớp với Backend
        updatedData
      );

      setSuccess(response.data.message || "Cập nhật thành công!");

      // Reset các ô input về 'undefined' (để xóa value)
      setPassword(undefined);
      setName(undefined);
      setUsername(undefined);
      setEmail(undefined);
      setMobile(undefined);
      setNotes(undefined); // 🚀 ĐÃ THÊM

      // Cập nhật placeholder với dữ liệu mới nhất
      setOriginalUser(response.data.user);

      // Tự động quay về trang danh sách sau 2 giây
      setTimeout(() => navigate("/dashboard/users"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  // --- Logic hiển thị (Render) ---

  if (loading && !originalUser) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  if (error && !originalUser) {
    return (
      <div className="p-8 text-center text-red-600 font-bold">{error}</div>
    );
  }

  if (!originalUser) {
    return <div className="p-8 text-center">Không tìm thấy người dùng.</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link
        to="/dashboard/users"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4 group"
      >
        <ArrowLeft
          size={18}
          className="mr-2 group-hover:-translate-x-1 transition"
        />
        Quay lại danh sách
      </Link>

      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
        Chỉnh sửa: {originalUser.name}
      </h1>

      <form
        onSubmit={handleSave}
        className="bg-white p-6 rounded-lg shadow-lg space-y-4"
      >
        {/* Tên */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên</label>
          <input
            type="text"
            value={name || ""} // Dùng '|| ""' để tránh lỗi React "controlled component"
            onChange={(e) => setName(e.target.value)}
            placeholder={originalUser.name}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            value={username || ""}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={originalUser.username}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email || ""}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={originalUser.email}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        {/* Số điện thoại */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={mobile || ""}
            onChange={(e) => setMobile(e.target.value)}
            placeholder={originalUser.mobile || "Chưa có SĐT"}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* 🚀 ĐÃ THÊM: Ghi chú */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ghi chú (Admin)
          </label>
          <textarea
            rows="3"
            value={notes || ""}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              originalUser.notes || "Thêm ghi chú cho tài khoản này..."
            }
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Mật khẩu mới */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Đặt mật khẩu mới (Bỏ trống nếu không đổi)
          </label>
          <input
            type="password"
            value={password || ""}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="••••••••"
          />
        </div>

        {/* Nút Lưu */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} className="mr-2" />
            )}
            Lưu thay đổi
          </button>
        </div>

        {/* Thông báo */}
        {error && (
          <div className="text-center text-red-600 font-medium">{error}</div>
        )}
        {success && (
          <div className="text-center text-green-600 font-medium">
            {success}
          </div>
        )}
      </form>
    </div>
  );
};

export default UserEditPage;
