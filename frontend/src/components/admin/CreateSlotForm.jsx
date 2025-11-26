import React, { useState } from "react";
import axios from "axios";
import {
  Loader2,
  Plus,
  FileText,
  Settings,
  Zap,
  Car,
  Bike,
  Check,
  ChevronDown,
} from "lucide-react"; // Thêm Check và ChevronDown
import { Button } from "@/components/ui/button";
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
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Import cn nếu có

// === CẤU HÌNH VÀ HẰNG SỐ ===
const DEFAULT_VEHICLE_TYPE = "motorbike";

const AREA_OPTIONS = [
  {
    value: "motorbike",
    label: "Khu Xe Máy",
    icon: <Zap className="h-4 w-4 text-green-600" />,
    prefix: "XM-",
  },
  {
    value: "bicycle",
    label: "Khu Xe Đạp",
    icon: <Bike className="h-4 w-4 text-purple-600" />,
    prefix: "XD-",
  },
  {
    value: "car",
    label: "Khu Ô Tô",
    icon: <Car className="h-4 w-4 text-blue-600" />,
    prefix: "OTO-",
  },
];
// =================================================================
// === COMPONENT CHÍNH ===
// =================================================================
function CreateSlotForm({ onSlotCreated }) {
  const [formData, setFormData] = useState({
    vehicleType: DEFAULT_VEHICLE_TYPE,
    area: DEFAULT_VEHICLE_TYPE,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Lấy icon và prefix dựa trên state
  const currentSlotConfig =
    AREA_OPTIONS.find((o) => o.value === formData.vehicleType) ||
    AREA_OPTIONS[0];

  // Xử lý thay đổi Select
  const handleSelectChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      vehicleType: value,
      area: value,
    }));
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { vehicleType, area, notes } = formData;

    try {
      // ✅ Gọi POST /api/admin/parking
      const res = await axios.post("/api/admin/parking", {
        vehicleType,
        area,
        notes,
      });

      setMessage(res.data?.message || `Đã tạo thành công ô đỗ mới!`);
      // Reset form
      setFormData({
        vehicleType: DEFAULT_VEHICLE_TYPE,
        area: DEFAULT_VEHICLE_TYPE,
        notes: "",
      });
      if (onSlotCreated) onSlotCreated();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Lỗi khi tạo chỗ đỗ. Vui lòng kiểm tra kết nối và quyền Admin.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // THAY ĐỔI: Thêm màu pastel (bg-indigo-50/bg-white), bo tròn góc lớn (rounded-2xl) và đổ bóng nổi (shadow-2xl)
    <Card className="p-8 rounded-2xl shadow-2xl border border-indigo-100 bg-white">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b pb-3">
        <Plus className="h-6 w-6 text-indigo-600" /> Thêm Chỗ Đỗ Mới
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* KHỐI CẤU HÌNH: Màu pastel nhạt và bo tròn */}
        <div className="space-y-6 p-6 rounded-xl border border-pink-200 bg-indigo-50/50 shadow-inner">
          <h2 className="text-xl font-bold text-indigo-800 flex items-center gap-2">
            <Settings className="h-5 w-5" /> Cấu hình ô đỗ
          </h2>

          {/* Khu Vực / Loại Xe */}
          <div className="space-y-2">
            {" "}
            {/* Tăng spacing */}
            <Label
              htmlFor="vehicleType"
              className="font-semibold text-sm flex items-center gap-1 text-indigo-700"
            >
              Loại Xe (Bắt buộc)
            </Label>
            <Select
              value={formData.vehicleType}
              onValueChange={handleSelectChange}
              disabled={loading}
            >
              <SelectTrigger
                id="vehicleType"
                // THAY ĐỔI: Kích thước lớn hơn, bo tròn, đổ bóng nhẹ
                className="w-full h-14 rounded-xl border-pink-300 shadow-md transition-shadow hover:shadow-lg bg-white text-base font-semibold"
              >
                <span className="flex items-center gap-3">
                  {currentSlotConfig.icon}
                  <SelectValue placeholder="Chọn loại xe và khu vực..." />
                </span>
              </SelectTrigger>
              <SelectContent
                // Fix lỗi hiển thị Select Content
                className="rounded-xl border-pink-200 shadow-xl bg-white"
              >
                {AREA_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-base cursor-pointer hover:bg-indigo-50/50"
                  >
                    <span className="flex items-center gap-2">
                      {option.icon}
                      {option.label} ({option.prefix})
                      <span className="ml-auto opacity-50">
                        <Check
                          className={cn(
                            "h-4 w-4",
                            formData.vehicleType === option.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Ghi Chú */}
          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="font-semibold text-sm flex items-center gap-1 text-indigo-700"
            >
              <FileText className="h-4 w-4" /> Ghi Chú (tùy chọn)
            </Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Ví dụ: Gần thang máy hoặc khu vực cần lưu ý..."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              disabled={loading}
              // THAY ĐỔI: Bo tròn và đổ bóng
              className="resize-none rounded-xl border-pink-300 shadow-md focus:shadow-lg transition-shadow bg-white"
            />
          </div>
        </div>

        {/* Thông báo lỗi/thành công */}
        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertDescription className="font-semibold">
              {error}
            </AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert className="bg-green-100 border-green-400 text-green-700 rounded-xl">
            <AlertDescription className="font-semibold">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Nút Tạo mới */}
        <Button
          type="submit"
          // THAY ĐỔI: Màu chủ đạo, hiệu ứng nổi bật (shadow)
          className="w-full h-12 rounded-xl bg-pink-400 hover:bg-yellow-400 text-white text-lg font-bold shadow-lg shadow-indigo-300 transition-all hover:scale-[1.01]"
          disabled={loading || !formData.vehicleType}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Plus className="h-5 w-5 mr-2" />
          )}
          Tạo mới (Tự động)
        </Button>
      </form>
    </Card>
  );
}

export default CreateSlotForm;
