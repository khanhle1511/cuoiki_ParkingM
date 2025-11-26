import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

// --- SHADCN COMPONENTS ---
import { Settings } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// --- IMPORT CÁC COMPONENT CON ---
import HourlyPriceEditor from "@/components/admin/HourlyPriceEditor";
import SubscriptionForm from "@/components/admin/SubscriptionForm";
import SubscriptionTable from "@/components/admin/SubscriptionTable";

// =================================================================
// === COMPONENT CHÍNH: PRICING MANAGEMENT PAGE ===
// =================================================================
function PricingManagementPage() {
  // State chứa tất cả dữ liệu giá (Hourly và Subscriptions)
  const [allPricingData, setAllPricingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State để lưu gói đang được chọn để chỉnh sửa (null = chế độ tạo mới)
  const [editingPackage, setEditingPackage] = useState(null);

  // Hàm gọi API để lấy tất cả dữ liệu giá
  // Sử dụng useCallback để tránh tạo lại hàm không cần thiết khi re-render
  const fetchAllPricing = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // API: GET /api/admin/pricing/admin (Lấy tất cả gói, bao gồm cả inactive)
      const res = await axios.get("/api/admin/pricing/admin");
      setAllPricingData(res.data);
    } catch (err) {
      console.error("Lỗi fetch data:", err);
      setError("Lỗi khi tải bảng giá và gói dịch vụ.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect: Tải dữ liệu khi component được mount lần đầu
  useEffect(() => {
    fetchAllPricing();
  }, [fetchAllPricing]);

  // --- HANDLERS ---

  // 1. Xử lý khi Form Submit thành công (Tạo mới hoặc Cập nhật xong)
  const handleFormSuccess = () => {
    // Tải lại dữ liệu mới nhất từ server
    fetchAllPricing();
    // Thoát chế độ chỉnh sửa (nếu có), quay về form tạo mới
    setEditingPackage(null);
    // Cuộn trang lên đầu để người dùng thấy thông báo thành công hoặc form trống
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 2. Xử lý khi bấm nút "Hủy" trên Form (khi đang sửa)
  const handleCancelEdit = () => {
    setEditingPackage(null); // Reset về chế độ tạo mới
  };

  // 3. Xử lý khi bấm nút "Sửa" (Edit) trên Bảng danh sách
  const handleEditClick = (pkg) => {
    setEditingPackage(pkg); // Đưa dữ liệu gói vào state để Form hiển thị
    // Cuộn trang lên vị trí của Form để người dùng bắt đầu sửa ngay
    // Giả sử Form nằm ở khoảng 200px từ đỉnh trang
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  // --- DATA FILTERING ---

  // Lọc giá theo giờ để truyền riêng vào HourlyPriceEditor
  const hourlyPricing = allPricingData.filter((p) => p.rateType === "Hourly");

  // Lọc các gói đăng ký (không phải Hourly) để truyền vào SubscriptionTable
  const subscriptionPricing = allPricingData.filter(
    (p) => p.rateType !== "Hourly"
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 min-h-screen bg-slate-50/50">
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
        <Settings className="h-8 w-8 text-indigo-600" />
        Quản lý Bảng Giá & Gói Dịch Vụ
      </h1>

      {/* ALERT LỖI CHUNG */}
      {error && (
        <Alert variant="destructive" className="animate-pulse">
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8">
        {/* KHỐI 1: CẬP NHẬT GIÁ THEO GIỜ */}
        <section>
          <HourlyPriceEditor
            pricingData={hourlyPricing}
            onRefresh={fetchAllPricing}
            isLoading={loading}
          />
        </section>

        {/* KHỐI 2: FORM TẠO MỚI / CẬP NHẬT GÓI */}
        <section>
          {/* - onSubscriptionCreated: Gọi khi save thành công
                - initialData: Dữ liệu gói cần sửa (nếu null -> Form trắng để tạo mới)
                - onCancel: Gọi khi bấm nút X (Hủy sửa)
            */}
          <SubscriptionForm
            onSubscriptionCreated={handleFormSuccess}
            initialData={editingPackage}
            onCancel={handleCancelEdit}
          />
        </section>

        {/* KHỐI 3: BẢNG DANH SÁCH GÓI */}
        <section>
          {/* - subscriptionData: Danh sách gói đã lọc
                - onRefresh: Gọi khi Xóa/Khóa thành công
                - onEdit: Gọi khi bấm nút Sửa ở từng dòng
            */}
          <SubscriptionTable
            subscriptionData={subscriptionPricing}
            onRefresh={fetchAllPricing}
            isLoading={loading}
            onEdit={handleEditClick}
          />
        </section>
      </div>
    </div>
  );
}

export default PricingManagementPage;
