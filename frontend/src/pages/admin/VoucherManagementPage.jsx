import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Ticket,
  Calendar,
  Copy,
  MoreHorizontal,
  Edit,
  Trash2,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import Modal Tạo/Sửa Voucher
import CreateVoucherModal from "@/pages/admin/VoucherManagementPage/CreateVoucherModal";

const VoucherManagementPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // State quản lý Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  // 1. Fetch Data
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/vouchers");
      setVouchers(res.data);
    } catch (error) {
      console.error("Lỗi tải voucher:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // 2. Handlers
  const handleCreate = () => {
    console.log("Click Thêm Mới"); // Debug log
    setEditingVoucher(null); // Đảm bảo không có data cũ
    setIsCreateModalOpen(true); // Mở modal
  };

  const handleEdit = (voucher) => {
    setEditingVoucher(voucher);
    setIsCreateModalOpen(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`/api/admin/vouchers/${id}/toggle`);
      fetchVouchers();
    } catch (error) {
      alert("Lỗi khi đổi trạng thái");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa voucher này?")) return;
    try {
      await axios.delete(`/api/admin/vouchers/${id}`);
      fetchVouchers();
    } catch (error) {
      alert("Không thể xóa voucher đang được sử dụng");
    }
  };

  const handleSaveVoucher = async (formData) => {
    try {
      if (editingVoucher) {
        await axios.put(`/api/admin/vouchers/${editingVoucher._id}`, formData);
      } else {
        await axios.post("/api/admin/vouchers", formData);
      }
      setIsCreateModalOpen(false);
      fetchVouchers();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi lưu voucher");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Đã sao chép mã: ${text}`);
  };

  // 3. Filter Logic
  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch =
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "ALL") return matchesSearch;
    if (filterStatus === "ACTIVE") return matchesSearch && v.isActive;
    if (filterStatus === "INACTIVE") return matchesSearch && !v.isActive;
    return matchesSearch;
  });

  return (
    <div className="p-6 min-h-screen bg-slate-50 space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Ticket className="text-indigo-600" /> Quản lý Mã Giảm Giá
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tạo và quản lý các chương trình khuyến mãi, Loyalty cho khách hàng.
          </p>
        </div>

        {/* 🔥 NÚT THÊM MỚI (ĐÃ KIỂM TRA KỸ) */}
        <Button
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 px-6 h-12 text-base font-medium rounded-xl transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" /> Thêm Voucher Mới
        </Button>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <Tabs
          defaultValue="ALL"
          onValueChange={setFilterStatus}
          className="w-full md:w-auto"
        >
          <TabsList className="bg-white border h-11 rounded-xl p-1">
            <TabsTrigger value="ALL" className="rounded-lg px-4 h-9">
              Tất cả
            </TabsTrigger>
            <TabsTrigger
              value="ACTIVE"
              className="rounded-lg px-4 h-9 data-[state=active]:text-green-600 data-[state=active]:bg-green-50"
            >
              Đang chạy
            </TabsTrigger>
            <TabsTrigger
              value="INACTIVE"
              className="rounded-lg px-4 h-9 data-[state=active]:text-slate-600 data-[state=active]:bg-slate-100"
            >
              Đã đóng
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm mã voucher..."
            className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- VOUCHER GRID LIST --- */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-2"></div>
          Đang tải dữ liệu...
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="bg-slate-50 p-4 rounded-full mb-3">
            <Ticket className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">
            Chưa tìm thấy voucher nào phù hợp.
          </p>
          <Button
            variant="link"
            onClick={handleCreate}
            className="text-indigo-600 mt-1"
          >
            Tạo voucher ngay
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVouchers.map((voucher) => {
            const isExpired = new Date(voucher.expirationDate) < new Date();
            // Tính phần trăm sử dụng
            const usagePercent = Math.min(
              (voucher.usedCount / voucher.usageLimit) * 100,
              100
            );

            return (
              <Card
                key={voucher._id}
                className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-l-4 ${
                  voucher.isActive ? "border-l-green-500" : "border-l-slate-300"
                }`}
              >
                {/* Background Pattern (Trang trí) */}
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-slate-100 to-transparent rounded-bl-full opacity-50 -z-10 transition-all group-hover:scale-110"></div>

                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-1">
                    <Badge
                      className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold border-0 ${
                        voucher.isActive
                          ? isExpired
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {voucher.isActive
                        ? isExpired
                          ? "Hết hạn"
                          : "Đang mở"
                        : "Đã khóa"}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
                        >
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={5} className="w-40 bg-white rounded-lg shadow-lg border border-slate-200 p-1">
                        <DropdownMenuItem
                          onClick={() => handleEdit(voucher)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(voucher._id)}
                          className="cursor-pointer"
                        >
                          <Power className="mr-2 h-4 w-4" />{" "}
                          {voucher.isActive ? "Tạm khóa" : "Kích hoạt"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50"
                          onClick={() => handleDelete(voucher._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Mã Code - Có hiệu ứng hover */}
                  <div
                    className="flex items-center gap-3 cursor-pointer w-fit"
                    onClick={() => copyToClipboard(voucher.code)}
                    title="Click để sao chép"
                  >
                    <h3 className="text-2xl font-black text-slate-800 tracking-wide font-mono group-hover:text-indigo-600 transition-colors">
                      {voucher.code}
                    </h3>
                    <Copy className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                  <CardDescription className="line-clamp-1 mt-1 text-slate-500">
                    {voucher.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-3 space-y-4">
                  {/* Giá trị giảm */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-indigo-600">
                      {voucher.discountType === "PERCENTAGE"
                        ? voucher.discountValue
                        : voucher.discountValue / 1000}
                    </span>
                    <span className="text-sm font-semibold text-indigo-400">
                      {voucher.discountType === "PERCENTAGE"
                        ? "% OFF"
                        : "k VND"}
                    </span>
                  </div>

                  {/* Thanh tiến trình sử dụng */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>
                        Đã dùng:{" "}
                        <span className="text-slate-700">
                          {voucher.usedCount}
                        </span>
                      </span>
                      <span>
                        Giới hạn:{" "}
                        <span className="text-slate-700">
                          {voucher.usageLimit}
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          usagePercent >= 90 ? "bg-red-500" : "bg-indigo-500"
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 pb-4 border-t bg-slate-50/50 flex justify-between items-center text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Hết hạn:{" "}
                      {new Date(voucher.expirationDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>

                  {/* Icon Loyalty nếu có */}
                  {voucher.triggerType !== "NONE" && (
                    <div
                      className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100"
                      title={`Tự động tặng khi đạt ${voucher.triggerType}`}
                    >
                      <GiftIcon className="w-3 h-3" />
                      <span>Tự động</span>
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* --- MODAL TẠO/SỬA --- */}
      {/* Đảm bảo isOpen được liên kết với state isCreateModalOpen */}
      <CreateVoucherModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveVoucher}
        initialData={editingVoucher}
      />
    </div>
  );
};

// Icon Gift nhỏ
const GiftIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </svg>
);

export default VoucherManagementPage;
