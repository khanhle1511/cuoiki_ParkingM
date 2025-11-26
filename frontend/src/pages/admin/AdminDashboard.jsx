import React from "react";
import CreateSlotForm from "../../components/admin/CreateSlotForm"; // Form tạo chỗ cũ của bạn
import FullParkingMap from "../../components/dashboard/FullParkingMap"; // Map mới

const AdminDashboard = () => {
  const handleSlotCreated = () => {
    // Tạm thời reload trang để cập nhật lại Map sau khi tạo
    window.location.reload();
  };

  return (
    <div className="p-4 space-y-6">
      {/* Khối tạo chỗ đỗ mới */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Thêm Chỗ Đỗ Mới
        </h2>
        <CreateSlotForm onSlotCreated={handleSlotCreated} />
      </div>

      {/* Khối bản đồ quản lý */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Quản lý Hiện trạng Bãi xe
        </h2>
        <FullParkingMap />
      </div>
    </div>
  );
};

export default AdminDashboard;
