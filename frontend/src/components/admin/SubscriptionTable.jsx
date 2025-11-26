import React, { useState, useEffect } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Settings,
  Loader2,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Car,
} from "lucide-react";
import {
  formatCurrency,
  SUBSCRIPTION_RATE_TYPES,
  VEHICLE_TYPES,
} from "@/config/PricingConfig.jsx";

const getRandomPastelColor = () => {
  const colors = [
    "bg-blue-100/50 hover:bg-blue-200/50 border-blue-200",
    "bg-green-100/50 hover:bg-green-200/50 border-green-200",
    "bg-yellow-100/50 hover:bg-yellow-200/50 border-yellow-200",
    "bg-red-100/50 hover:bg-red-200/50 border-red-200",
    "bg-purple-100/50 hover:bg-purple-200/50 border-purple-200",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

function SubscriptionTable({ subscriptionData, onRefresh, isLoading, onEdit }) {
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);

  // State Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [actionType, setActionType] = useState(null); // 'delete' | 'toggle'

  const [packageColors, setPackageColors] = useState({});

  // Giữ nguyên màu sắc cho mỗi gói khi re-render
  useEffect(() => {
    const newColors = { ...packageColors };
    let hasChange = false;
    subscriptionData.forEach((pkg) => {
      if (!newColors[pkg._id]) {
        newColors[pkg._id] = getRandomPastelColor();
        hasChange = true;
      }
    });
    if (hasChange) setPackageColors(newColors);
  }, [subscriptionData]);

  const openConfirmationModal = (pkg, type) => {
    setSelectedPackage(pkg);
    setActionType(type);
    setModalOpen(true);
  };

  const handleConfirmationAction = async () => {
    if (!selectedPackage) return;
    setLocalLoading(true);
    // Không đóng modal ngay để hiện loading nếu cần, hoặc đóng luôn tùy trải nghiệm
    // Ở đây ta đóng luôn cho mượt
    setModalOpen(false);

    try {
      const token = localStorage.getItem("authToken");
      // Axios tự động thêm Authorization nếu bạn đã cấu hình global,
      // nhưng ở đây ta thêm thủ công để chắc chắn (như fetch) nếu dùng axios instance thường.
      // Tuy nhiên, tốt nhất là dùng axios instance có interceptor.
      // Ở đây tôi giả định axios của bạn chưa có interceptor, nên thêm header.
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (actionType === "toggle") {
        const newStatus = !selectedPackage.isActive;
        await axios.put(
          `/api/admin/pricing/${selectedPackage._id}`,
          { isActive: newStatus },
          config
        );
        onRefresh();
      } else if (actionType === "delete") {
        await axios.delete(`/api/admin/pricing/${selectedPackage._id}`, config);
        onRefresh();
      }
    } catch (err) {
      console.error("Action Error:", err);
      setError(err.response?.data?.message || "Lỗi thực hiện hành động.");
    } finally {
      setLocalLoading(false);
      setSelectedPackage(null);
    }
  };

  const getVehicleIcon = (type) => {
    const vehicle = VEHICLE_TYPES.find((v) => v.value === type);
    return vehicle ? (
      React.cloneElement(vehicle.icon, { className: "h-4 w-4" })
    ) : (
      <Car className="h-4 w-4" />
    );
  };

  // Lọc bỏ gói Hourly (nếu có)
  const packages = subscriptionData.filter((p) => p.rateType !== "Hourly");

  return (
    <Card className="shadow-2xl border border-slate-200 rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-700 flex items-center gap-2">
          <Settings className="h-5 w-5" /> Danh Sách Gói Dịch Vụ
          {localLoading && (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <Skeleton className="h-[200px] w-full rounded-xl" />
        ) : packages.length === 0 ? (
          <p className="text-center text-slate-500 py-8">
            Chưa có gói dịch vụ nào.
          </p>
        ) : (
          <div className="space-y-4">
            {packages.map((pkg) => (
              <div
                key={pkg._id}
                className={cn(
                  "flex items-center justify-between p-4 border rounded-xl shadow-sm hover:shadow-md transition-all duration-300",
                  packageColors[pkg._id] || "bg-white"
                )}
              >
                {/* Tên & Loại xe */}
                <div className="flex flex-col w-1/4 min-w-[150px]">
                  <span
                    className="font-bold text-lg text-slate-800 truncate"
                    title={pkg.name}
                  >
                    {pkg.name || "Gói Khuyết Danh"}
                  </span>
                  <Badge className="w-fit mt-1 bg-white/80 text-slate-700 shadow-sm border border-slate-200 hover:bg-white">
                    {getVehicleIcon(pkg.vehicleType)}
                    <span className="ml-1 font-medium">
                      {VEHICLE_TYPES.find((v) => v.value === pkg.vehicleType)
                        ?.label || pkg.vehicleType}
                    </span>
                  </Badge>
                </div>

                {/* Giá & Đơn vị */}
                <div className="flex flex-col items-start w-1/4">
                  <span className="text-2xl font-extrabold text-indigo-600">
                    {formatCurrency(pkg.rate)}
                  </span>
                  <span className="text-sm text-slate-500 font-medium">
                    {SUBSCRIPTION_RATE_TYPES.find(
                      (r) => r.value === pkg.rateType
                    )?.label || pkg.rateType}
                  </span>
                </div>

                {/* Trạng Thái */}
                <div className="w-[100px] flex justify-center">
                  <Badge
                    variant={pkg.isActive ? "default" : "secondary"}
                    className={cn(
                      "px-3 py-1",
                      pkg.isActive
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-slate-400 hover:bg-slate-500 text-white"
                    )}
                  >
                    {pkg.isActive ? "Hoạt động" : "Đã khóa"}
                  </Badge>
                </div>

                {/* Hành Động */}
                <div className="flex justify-end gap-1 w-[150px]">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(pkg)}
                    className="text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-full"
                    title="Chỉnh sửa"
                  >
                    <Edit className="h-5 w-5" />
                  </Button>

                  {/* Nút Khóa/Mở khóa (Icon đảo ngược theo logic UX bạn yêu cầu) */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openConfirmationModal(pkg, "toggle")}
                    className={cn(
                      "rounded-full transition-colors",
                      pkg.isActive
                        ? "text-green-600 hover:bg-green-100"
                        : "text-orange-500 hover:bg-orange-100"
                    )}
                    title={
                      pkg.isActive
                        ? "Đang mở (Bấm để khóa)"
                        : "Đang khóa (Bấm để mở)"
                    }
                  >
                    {pkg.isActive ? (
                      <Unlock className="h-5 w-5" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openConfirmationModal(pkg, "delete")}
                    className="text-red-500 hover:bg-red-100 hover:text-red-600 rounded-full"
                    title="Xóa gói"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* 🔥 MODAL CONFIRMATION (Đã style lại đẹp hơn) */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-xl border border-slate-100">
          <DialogHeader>
            <DialogTitle
              className={`text-xl ${
                actionType === "delete" ? "text-red-600" : "text-slate-800"
              }`}
            >
              {actionType === "delete"
                ? "Xác nhận Xóa"
                : "Xác nhận Thay đổi trạng thái"}
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2">
              {actionType === "delete" ? (
                <span>
                  Bạn có chắc chắn muốn xóa vĩnh viễn gói{" "}
                  <span className="font-bold text-slate-900">
                    {selectedPackage?.name}
                  </span>
                  ? Hành động này không thể hoàn tác.
                </span>
              ) : (
                <span>
                  Bạn có chắc chắn muốn{" "}
                  <span className="font-bold">
                    {selectedPackage?.isActive ? "KHÓA" : "MỞ KHÓA"}
                  </span>{" "}
                  gói{" "}
                  <span className="font-bold text-slate-900">
                    {selectedPackage?.name}
                  </span>
                  ?
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* 🔥 FIX LỖI MẤT NÚT: Đảm bảo DialogFooter hiển thị đúng */}
          <DialogFooter className="mt-4 flex flex-row justify-end gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 mr-2"
            >
              Hủy bỏ
            </Button>
            <Button
              variant={actionType === "delete" ? "destructive" : "default"}
              onClick={handleConfirmationAction}
              className={
                actionType === "toggle"
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {actionType === "delete" ? "Xóa vĩnh viễn" : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default SubscriptionTable;
