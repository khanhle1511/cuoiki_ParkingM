import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Gift, Tag } from "lucide-react";

const CreateVoucherModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    maxDiscountAmount: 0,
    minBillAmount: 0,
    usageLimit: 100,
    expirationDate: "",
    isActive: true,
    triggerType: "NONE",
    triggerValue: 0,
    maxUsagePerUser: 1,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        expirationDate: initialData.expirationDate
          ? new Date(initialData.expirationDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      // Reset default
      setFormData({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: 0,
        maxDiscountAmount: 0,
        minBillAmount: 0,
        usageLimit: 100,
        expirationDate: "",
        isActive: true,
        triggerType: "NONE",
        triggerValue: 0,
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.description || !formData.expirationDate) {
      alert("Vui lòng nhập đủ các trường bắt buộc (*)");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        // 🔥 FIX: Thêm !bg-white để ép buộc nền trắng, tránh bị trong suốt
        className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto !bg-white rounded-xl shadow-2xl border-0"
      >
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-indigo-700">
            {initialData ? (
              <EditIcon className="w-5 h-5" />
            ) : (
              <Tag className="w-5 h-5" />
            )}
            {initialData ? "Cập nhật Voucher" : "Tạo Mã Giảm Giá Mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-600">
                Mã Voucher <span className="text-red-500">*</span>
              </Label>
              <Input
                name="code"
                placeholder="VD: SUMMER2025"
                value={formData.code}
                onChange={handleChange}
                disabled={!!initialData}
                className="font-mono uppercase font-bold border-slate-300 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600">
                Ngày hết hạn <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                className="border-slate-300 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-slate-600">
                Mô tả ngắn <span className="text-red-500">*</span>
              </Label>
              <Input
                name="description"
                placeholder="VD: Giảm giá chào hè cho khách hàng mới..."
                value={formData.description}
                onChange={handleChange}
                className="border-slate-300"
              />
            </div>
          </div>

          {/* KHỐI 2: GIÁ TRỊ GIẢM */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
            <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
              <Tag className="w-4 h-4" /> Thiết lập giảm giá
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại giảm</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(val) =>
                    handleSelectChange("discountType", val)
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {" "}
                    {/* Thêm bg-white cho dropdown */}
                    <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                    <SelectItem value="FIXED">Số tiền (VND)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Giá trị</Label>
                <div className="relative">
                  <Input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    className="bg-white pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    {formData.discountType === "PERCENTAGE" ? "%" : "đ"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Giảm tối đa</Label>
                <Input
                  type="number"
                  name="maxDiscountAmount"
                  placeholder="0 = Không giới hạn"
                  value={formData.maxDiscountAmount}
                  onChange={handleChange}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Đơn tối thiểu</Label>
                <Input
                  type="number"
                  name="minBillAmount"
                  value={formData.minBillAmount}
                  onChange={handleChange}
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          {/* KHỐI 3: SỐ LƯỢNG & TRẠNG THÁI */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <Label>Số lượng phát hành</Label>
              <Input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label>Giới hạn mỗi User</Label>
              <Input
                type="number"
                name="maxUsagePerUser"
                min="1"
                value={formData.maxUsagePerUser}
                onChange={handleChange}
                className="border-slate-300"
                placeholder="Mặc định: 1"
              />
            </div>
            <div className="flex flex-col space-y-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <Label className="cursor-pointer flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(val) =>
                    setFormData((prev) => ({ ...prev, isActive: val }))
                  }
                />
                <span className="text-green-700 font-medium">
                  Kích hoạt voucher ngay
                </span>
              </Label>
            </div>
          </div>

          {/* KHỐI 4: LOYALTY (Màu tím) */}
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 space-y-3">
            <h3 className="font-bold text-indigo-700 text-sm flex items-center gap-2">
              <Gift className="w-4 h-4" /> Tự động tặng (Loyalty)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-indigo-900">Điều kiện</Label>
                <Select
                  value={formData.triggerType}
                  onValueChange={(val) =>
                    handleSelectChange("triggerType", val)
                  }
                >
                  <SelectTrigger className="bg-white border-indigo-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="NONE">Không (Tặng tay)</SelectItem>
                    <SelectItem value="SPENDING_MILESTONE">
                      Đạt mốc Chi Tiêu
                    </SelectItem>
                    <SelectItem value="PARKING_COUNT_MILESTONE">
                      Đạt mốc Số Lần Đỗ
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.triggerType !== "NONE" && (
                <div className="space-y-2 animate-in slide-in-from-left-2">
                  <Label className="text-indigo-900">Mức cần đạt</Label>
                  <Input
                    type="number"
                    name="triggerValue"
                    value={formData.triggerValue}
                    onChange={handleChange}
                    className="bg-white border-indigo-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8"
          >
            {initialData ? "Lưu Thay Đổi" : "Tạo Voucher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Icon helper
const EditIcon = ({ className }) => (
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
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

export default CreateVoucherModal;
