import React, { useState, useEffect } from "react";
import axios from "axios";
// SỬA LỖI: cn là một tiện ích cần được import
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom"; // 🚀 Dùng để chuyển hướng tới trang chi tiết User

// --- SHADCN UI COMPONENTS ---
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- ICONS ---
import {
  Edit,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  User,
  Hash,
  Clock,
  MapPin,
  Car,
  FileText,
  Smartphone,
  Bike,
  Zap,
} from "lucide-react";

// =================================================================
// === KHU VỰC HẰNG SỐ VÀ HÀM TIỆN ÍCH (PHẢI NẰM NGOÀI COMPONENT) ===
// =================================================================

const AREA_OPTIONS = [
  { value: "motorbike", label: "Khu Xe Máy" },
  { value: "bicycle", label: "Khu Xe Đạp" },
  { value: "car-1", label: "Khu Ô Tô 1" },
  { value: "car-2", label: "Khu Ô Tô 2" },
];

const getStatusColor = (status) => {
  if (status === "occupied") return "bg-red-500 hover:bg-red-500";
  if (status === "maintenance") return "bg-gray-500 hover:bg-gray-500";
  if (status === "booked") return "bg-yellow-500 hover:bg-yellow-500";
  return "bg-green-600 hover:bg-green-600"; // Đã sửa màu xanh lá cây
};

const getVehicleIcon = (type) => {
  if (type === "car") return <Car />;
  if (type === "motorbike") return <Zap />; // Dùng Zap (sét) cho xe máy
  if (type === "bicycle") return <Bike />;
  return <MapPin />;
};

// =================================================================
// === COMPONENT CHÍNH: ADMIN SLOT MODAL ===
// =================================================================
function SlotAdminModal({ slot, onClose, onRefresh }) {
  // 🚀 BƯỚC 1: KHAI BÁO HOOKS
  const navigate = useNavigate();

  // === STATE LOGIC ===
  const [viewMode, setViewMode] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editFormData, setEditFormData] = useState({
    area: slot?.area || "motorbike",
    notes: slot?.notes || "",
  });

  // Reset state khi slot thay đổi
  useEffect(() => {
    if (slot) {
      setEditFormData({
        area: slot.area || "motorbike",
        notes: slot.notes || "",
      });
      setViewMode("details");
      setError(null);
    }
  }, [slot]);

  if (!slot) return null;

  // === CÁC HÀM XỬ LÝ API (CRUD) ===

  // 1. Khóa/Mở (Toggle Status) - PUT /api/parking/:id/status
  const handleToggleStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.put(`/api/parking/${slot._id}/status`);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || "Thao tác thất bại.");
      setIsLoading(false);
    }
  };

  // 2. Sửa (Update Slot) - PUT /api/parking/:id
  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Gửi NOTES VÀ AREA CŨ (đã khóa) lên Backend để tránh lỗi 400
      await axios.put(`/api/parking/${slot._id}`, {
        notes: editFormData.notes,
        area: slot.area, // Giữ area cũ (đã khóa)
      });
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi cập nhật.");
      setIsLoading(false);
    }
  };

  // 3. Xóa (Delete Slot) - DELETE /api/parking/:id
  const handleDeleteSlot = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/parking/${slot._id}`);
      onRefresh();
    } catch (err) {
      setError(
        err.response?.data?.message || "Lỗi khi xóa. Hãy đảm bảo ô trống."
      );
      setIsLoading(false);
    }
  };

  // 🚀 HÀM NAVIGATE TỚI USER DETAIL
  const navigateToUserDetail = (userId) => {
    if (userId) {
      onClose(); // Đóng modal hiện tại
      navigate(`/dashboard/users/${userId}`); // Chuyển sang trang chi tiết
    }
  };

  // === RENDER CHI TIẾT Ô ĐỖ (NEW UI & HIỆU ỨNG) ===
  const renderDetailsView = () => {
    const checkInTime = slot.currentLog?.checkInTime
      ? new Date(slot.currentLog.checkInTime).toLocaleString("vi-VN")
      : "N/A";
    const isOccupied = slot.status === "occupied";
    const userDetails = slot.currentLog?.user;

    return (
      <div className="space-y-6 pt-2">
        {/* 1. THÔNG TIN LOG XE (Nếu có xe) */}
        {isOccupied && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-md transition-shadow hover:shadow-lg space-y-3">
            <div className="flex items-center text-red-700 font-bold text-lg">
              <AlertTriangle className="h-5 w-5 mr-2" /> THÔNG TIN GỬI XE
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p className="text-slate-500 flex items-center gap-2">
                <Hash className="h-4 w-4" /> Biển số:
              </p>
              <p className="font-bold text-red-700 uppercase">
                {slot.currentLog.licensePlate || "N/A"}
              </p>

              <p className="text-slate-500 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Giờ vào:
              </p>
              <p className="font-medium">{checkInTime}</p>

              <p className="text-slate-500 flex items-center gap-2">
                <User className="h-4 w-4" /> Người đỗ:
              </p>
              <p
                className={cn(
                  "font-medium",
                  userDetails
                    ? "text-blue-600 cursor-pointer hover:underline font-semibold"
                    : "text-slate-800"
                )}
                onClick={() => navigateToUserDetail(userDetails?._id)} // 🚀 CLICK VÀO TÊN
              >
                {userDetails?.name || "N/A (Lỗi data)"}
              </p>

              <p className="text-slate-500 flex items-center gap-2">
                <Smartphone className="h-4 w-4" /> Email:
              </p>
              <p
                className={cn(
                  "font-medium text-xs break-words",
                  userDetails
                    ? "text-blue-600 cursor-pointer hover:underline font-semibold"
                    : "text-slate-800"
                )}
                onClick={() => navigateToUserDetail(userDetails?._id)} // 🚀 CLICK VÀO EMAIL
              >
                {userDetails?.email || "N/A"}
              </p>
            </div>
          </div>
        )}

        {/* 2. THÔNG TIN CHỖ ĐỖ (SLOT DETAILS) */}
        <h3 className="text-base font-semibold text-slate-700 mt-4 border-b pb-2">
          Cấu hình Ô đỗ
        </h3>
        <div className="rounded-xl shadow-md p-4 transition-shadow hover:shadow-lg grid grid-cols-2 gap-x-6 gap-y-3 text-sm bg-white">
          <p className="text-slate-500 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" /> Khu vực:
          </p>
          <Badge variant="secondary" className="w-fit uppercase">
            {AREA_OPTIONS.find((a) => a.value === slot.area)?.label ||
              slot.area}
          </Badge>

          <p className="text-slate-500 flex items-center gap-2">
            <Car className="h-4 w-4 text-blue-500" /> Loại xe:
          </p>
          <Badge className="w-fit uppercase">{slot.vehicleType}</Badge>

          <p className="text-slate-500 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" /> Ghi chú:
          </p>
          <p className="font-medium italic text-slate-700">
            {slot.notes || "Không có ghi chú"}
          </p>
        </div>
      </div>
    );
  };

  // === RENDER FORM SỬA (EDIT) ===
  const renderEditForm = () => (
    <form onSubmit={handleUpdateSlot} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1">
        <Label htmlFor="area">Khu Vực (Không thể thay đổi)</Label>
        <Select
          value={editFormData.area} // Chỉ hiển thị giá trị, không cho thay đổi
          disabled={true} // Khóa hoàn toàn
        >
          <SelectTrigger
            id="area"
            className="w-full bg-gray-100 cursor-not-allowed rounded-lg shadow-sm"
          >
            <SelectValue placeholder="Chọn khu vực..." />
          </SelectTrigger>
          <SelectContent>
            {AREA_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">Khu vực đã được khóa.</p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="notes">Ghi Chú</Label>
        <Textarea
          id="notes"
          name="notes"
          value={editFormData.notes}
          onChange={(e) =>
            setEditFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          rows={3}
          disabled={isLoading}
          className="rounded-lg shadow-sm focus:shadow-md transition-shadow"
        />
      </div>

      <DialogFooter className="pt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          type="button"
          onClick={() => setViewMode("details")}
          disabled={isLoading}
          className="rounded-lg shadow-sm hover:shadow-md"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md"
        >
          {isLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
        </Button>
      </DialogFooter>
    </form>
  );

  // === RENDER CONFIRM XÓA ===
  const renderConfirmDelete = () => (
    <Alert variant="destructive" className="rounded-xl shadow-lg">
      <AlertTitle className="flex items-center gap-2">
        <Trash2 className="h-5 w-5" /> Xác nhận Xóa Ô Đỗ
      </AlertTitle>
      <AlertDescription className="mt-2 text-base">
        Bạn có chắc chắn muốn xóa vĩnh viễn **Ô {slot.name}** không? Thao tác
        này không thể hoàn tác.
        <br />
        <span className="font-semibold">Lưu ý:</span> Chỉ có thể xóa ô trống.
      </AlertDescription>
      {error && (
        <AlertDescription className="mt-2 text-xs font-bold">
          {error}
        </AlertDescription>
      )}
      <DialogFooter className="pt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setViewMode("details")}
          disabled={isLoading}
          className="rounded-lg shadow-sm hover:shadow-md"
        >
          Hủy
        </Button>
        <Button
          onClick={handleDeleteSlot}
          disabled={isLoading}
          variant="destructive"
          className="rounded-lg shadow-sm hover:shadow-md"
        >
          {isLoading ? "Đang xóa..." : "Xác nhận Xóa"}
        </Button>
      </DialogFooter>
    </Alert>
  );

  // === RENDER CHÍNH ===
  return (
    <Dialog open={!!slot} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6 pt-10 rounded-xl bg-white shadow-xl overflow-visible">
        {/* 1. ICON NỔI (SIMULATION) */}
        <div
          className={cn(
            "absolute -top-5 left-5 h-14 w-14 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white z-10",
            getStatusColor(slot.status)
          )}
        >
          {React.cloneElement(getVehicleIcon(slot.vehicleType), {
            className: "h-6 w-6 text-white",
          })}
        </div>

        <DialogHeader className="pb-3 border-b mb-4 pt-4">
          <DialogTitle className="flex items-center justify-between text-2xl font-bold text-gray-800">
            Quản lý Ô {slot.name}
            {/* Status Badge */}
            <Badge
              className={cn(
                "text-white font-semibold text-sm px-3 py-1.5 rounded-full shadow-sm",
                getStatusColor(slot.status)
              )}
            >
              {slot.status.toUpperCase()}
            </Badge>
          </DialogTitle>
          {/* Thêm DialogDescription ẩn để fix lỗi Accessibility */}
          <p className="sr-only">
            Chi tiết quản lý và các thao tác Admin cho ô đỗ {slot.name}
          </p>
        </DialogHeader>

        {viewMode === "details" && renderDetailsView()}
        {viewMode === "edit" && renderEditForm()}
        {viewMode === "confirm-delete" && renderConfirmDelete()}

        {/* FOOTER HÀNH ĐỘNG CHUNG */}
        {viewMode === "details" && (
          <DialogFooter className="pt-4 flex justify-between items-center">
            {/* LEFT: DELETE button */}
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => setViewMode("confirm-delete")}
                disabled={slot.status === "occupied" || isLoading}
                title={
                  slot.status === "occupied"
                    ? "Không thể xóa khi có xe"
                    : "Xóa ô đỗ"
                }
                className="rounded-lg shadow-sm hover:shadow-md"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Xóa
              </Button>
            </div>
            {/* RIGHT: CLOSE, EDIT, TOGGLE buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-lg shadow-sm hover:shadow-md"
              >
                Đóng
              </Button>
              <Button
                variant="secondary"
                onClick={() => setViewMode("edit")}
                disabled={slot.status === "occupied" || isLoading}
                title={
                  slot.status === "occupied"
                    ? "Không thể sửa khi có xe"
                    : "Sửa thông tin"
                }
                className="rounded-lg shadow-sm hover:shadow-md"
              >
                <Edit className="h-4 w-4 mr-2" /> Sửa
              </Button>
              <Button
                onClick={handleToggleStatus}
                disabled={isLoading || slot.status === "occupied"}
                className={cn(
                  "text-white font-bold rounded-lg shadow-sm hover:shadow-md",
                  slot.status === "maintenance"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-500 hover:bg-gray-600"
                )}
              >
                {slot.status === "maintenance" ? (
                  <Unlock className="h-4 w-4 mr-2" />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                {slot.status === "maintenance" ? "Mở khóa" : "Khóa"}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SlotAdminModal;
