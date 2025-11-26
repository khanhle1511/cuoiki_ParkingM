import React from "react";
import { useNavigate } from "react-router-dom";
// 🚀 Import icons mới cho Avatar và các nút
import { FileText, Pencil, Trash2, ShieldCheck, User } from "lucide-react";

/**
 * Component con: Hiển thị Trạng thái (Đang đỗ / Không đỗ)
 * Lấy dữ liệu từ user.activeLog
 */
const getStatusBadge = (user) => {
  const isParking = user.activeLog;
  let text = "Không đỗ";
  let classes = "bg-red-100 text-red-700 font-medium"; // Trạng thái 'Inactive'

  if (isParking) {
    text = "Đang Đỗ";
    classes = "bg-green-100 text-green-700 font-medium"; // Trạng thái 'Active'
  }
  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${classes} whitespace-nowrap`}
    >
      {text}
    </span>
  );
};

/**
 * 🚀 YÊU CẦU 2 (ĐÃ SỬA): CẬP NHẬT COMPONENT AVATAR
 * Helper component for the round avatar (sử dụng ICONS)
 */
const UserAvatar = ({ user }) => {
  const isAdmin = user.role?.toLowerCase() === "admin";

  const bgClass = isAdmin ? "bg-red-100" : "bg-blue-100";
  const textClass = isAdmin ? "text-red-700" : "text-blue-700";

  return (
    <div
      className={`w-10 h-10 rounded-full ${bgClass} ${textClass} mr-3 flex items-center justify-center flex-shrink-0 text-lg font-bold shadow-sm ring-2 ring-gray-200`}
      title={user.role}
    >
      {/* 🚀 THAY ĐỔI: Hiển thị Icon Khiên (Admin) hoặc Người (User) */}
      {isAdmin ? <ShieldCheck size={20} /> : <User size={20} />}
    </div>
  );
};

// ===================================
// === COMPONENT BẢNG CHÍNH ===
// ===================================
/**
 * Nhận props:
 * - users: Danh sách người dùng (đã được lọc bởi component cha)
 * - handleDelete: Hàm (lấy userId) để gọi API xóa
 */
const UserTable = ({ users, handleDelete }) => {
  const navigate = useNavigate(); // Chuyển sang trang Chi tiết

  const handleViewDetails = (userId) => {
    navigate(userId); // (vd: /dashboard/users/123)
  }; // Chuyển sang trang Sửa

  const handleEdit = (userId) => {
    navigate(`${userId}/edit`); // (vd: /dashboard/users/123/edit)
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-[5%]">
                Ảnh
              </th>

              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-[20%]">
                Tên người dùng
              </th>

              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-[15%]">
                Mobile
              </th>

              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-[20%]">
                Email
              </th>

              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-[15%]">
                Trạng thái
              </th>

              <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider w-[15%]">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user._id}
                  className={`bg-white transition duration-300 ease-in-out border-b border-gray-100 
                   hover:bg-gray-50 hover:shadow-lg hover:-translate-y-px 
                  `}
                >
                  {/* 1. Cột Avatar (Đã cập nhật) */}

                  <td className="px-6 py-2 whitespace-nowrap">
                    <UserAvatar user={user} />
                  </td>
                  {/* 2. Cột Tên người dùng */}

                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {user.name}
                    </div>

                    <div className="text-xs text-gray-400">{user.role}</div>
                  </td>
                  {/* 3. Cột Mobile */}
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                    {user.mobile || "N/A"}
                  </td>
                  {/* 4. Cột Email */}
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  {/* 5. Cột Trạng thái Đỗ xe (Badge) */}

                  <td className="px-6 py-2 whitespace-nowrap">
                    {getStatusBadge(user)}
                  </td>
                  {/* 6. Cột Thao tác (Operation) */}

                  <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {/* Nút Xem chi tiết (Đã sửa) */}

                      <button
                        onClick={() => handleViewDetails(user._id)}
                        className="text-gray-400 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-50 transition"
                        title="Xem chi tiết"
                      >
                        <FileText size={18} />
                      </button>
                      {/* Nút Sửa (Đã sửa) */}

                      <button
                        onClick={() => handleEdit(user._id)}
                        className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={18} />
                      </button>
                      {/* Nút Xóa (Đã sửa) */}

                      {user.role !== "Admin" && ( // <--- ĐIỀU KIỆN ĐÃ SỬA
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition"
                          title="Xóa"
                        >
                          <Trash2 size={18} />{" "}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  {/* 🚀 Sửa: Hiển thị "Đang tải" nếu loading=true */}

                  {users.length === 0 && !loading
                    ? "Không tìm thấy người dùng nào."
                    : "Đang tải..."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
