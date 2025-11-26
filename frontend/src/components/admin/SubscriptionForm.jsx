import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Loader2, Save, X } from "lucide-react"; // Thêm icon Save, X

import {
  VEHICLE_TYPES,
  SUBSCRIPTION_RATE_TYPES,
} from "@/config/PricingConfig.jsx";

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseNumber = (value) => {
  return parseInt(String(value).replace(/\./g, "")) || 0;
};

// Thêm prop initialData (dữ liệu cũ khi sửa) và onCancel (hủy sửa)
function SubscriptionForm({
  onSubscriptionCreated,
  initialData = null,
  onCancel,
}) {
  const navigate = useNavigate();
  const isEditing = !!initialData; // Kiểm tra xem có đang ở chế độ sửa không

  const [formData, setFormData] = useState({
    packageName: "",
    rate: 0,
    vehicleType: VEHICLE_TYPES[0].value,
    rateType: SUBSCRIPTION_RATE_TYPES[0].value,
    description: "",
    detailDescription: "",
  });

  const [cardImageFile, setCardImageFile] = useState(null);
  const [detailImageFile, setDetailImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Effect: Điền dữ liệu vào form khi initialData thay đổi (khi bấm Sửa)
  useEffect(() => {
    if (initialData) {
      setFormData({
        packageName: initialData.name || "",
        rate: initialData.rate || 0,
        vehicleType: initialData.vehicleType || VEHICLE_TYPES[0].value,
        rateType: initialData.rateType || SUBSCRIPTION_RATE_TYPES[0].value,
        description: initialData.description || "",
        detailDescription: initialData.detailDescription || "",
      });
      // Reset file input khi chuyển sang gói khác
      setCardImageFile(null);
      setDetailImageFile(null);
      setMessage(null);
      setError(null);
    } else {
      // Reset form về mặc định nếu không sửa
      setFormData({
        packageName: "",
        rate: 0,
        vehicleType: VEHICLE_TYPES[0].value,
        rateType: SUBSCRIPTION_RATE_TYPES[0].value,
        description: "",
        detailDescription: "",
      });
    }
  }, [initialData]);

  const handleRateChange = (value) => {
    const cleanedValue = value.replace(/[^0-9]/g, "");
    const numericValue = parseNumber(cleanedValue);
    setFormData({ ...formData, rate: numericValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setMessage(null);

    if (formData.rate <= 0) {
      setError("Giá tiền phải lớn hơn 0.");
      setLoading(false);
      return;
    }

    const trimmedName = formData.packageName ? formData.packageName.trim() : "";
    if (!trimmedName) {
      setError("Vui lòng điền Tên Gói.");
      setLoading(false);
      return;
    }

    const data = new FormData();

    data.append("name", trimmedName);
    data.append("vehicleType", formData.vehicleType);
    data.append("rateType", formData.rateType);
    data.append("rate", formData.rate);
    data.append("durationValue", 1);
    data.append("description", formData.description || "");
    data.append("detailDescription", formData.detailDescription || "");

    // Chỉ gửi file nếu người dùng chọn file mới
    if (cardImageFile) {
      data.append("cardImage", cardImageFile);
    }
    if (detailImageFile) {
      data.append("detailImage", detailImageFile);
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Phiên đăng nhập hết hạn.");
        setTimeout(() => navigate("/login"), 2000);
        setLoading(false);
        return;
      }

      // Xác định URL và Method dựa trên chế độ Sửa hay Tạo
      const url = isEditing
        ? `/api/admin/pricing/${initialData._id}` // API cập nhật (PUT) - Bạn cần đảm bảo route này hỗ trợ upload file nếu muốn sửa ảnh
        : "/api/admin/pricing/admin"; // API tạo mới (POST)

      const method = isEditing ? "PUT" : "POST";

      // LƯU Ý: Route PUT /:id của bạn hiện tại (updatePricingById) có thể chưa hỗ trợ Multer upload.
      // Nếu bạn muốn sửa cả ảnh, bạn cần cập nhật route backend cho PUT cũng dùng upload middleware.
      // Tạm thời giả định route PUT đã được cấu hình hoặc bạn chỉ sửa text.

      const response = await fetch(url, {
        method: method,
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Phiên đăng nhập không hợp lệ.");
          localStorage.removeItem("authToken");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }
        throw new Error(result.message || "Lỗi từ server.");
      }

      setMessage(
        isEditing ? "Cập nhật gói thành công!" : "Tạo gói dịch vụ thành công!"
      );
      onSubscriptionCreated(); // Refresh danh sách

      if (!isEditing) {
        // Nếu là tạo mới thì reset form, nếu đang sửa thì giữ nguyên hoặc đóng form tùy logic cha
        setFormData({
          packageName: "",
          rate: 0,
          vehicleType: VEHICLE_TYPES[0].value,
          rateType: SUBSCRIPTION_RATE_TYPES[0].value,
          description: "",
          detailDescription: "",
        });
        setCardImageFile(null);
        setDetailImageFile(null);
      }
    } catch (err) {
      console.error("Lỗi Submission:", err);
      setError(err.message || "Lỗi khi xử lý.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={`shadow-2xl border ${
        isEditing
          ? "border-blue-200 bg-blue-50/70"
          : "border-purple-100 bg-purple-50/70"
      } rounded-3xl p-6 transition-all duration-300`}
    >
      <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
        <CardTitle
          className={`text-2xl font-extrabold ${
            isEditing ? "text-blue-800" : "text-purple-800"
          } flex items-center gap-2`}
        >
          {isEditing ? (
            <Save className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
          {isEditing ? "Cập Nhật Gói Dịch Vụ" : "Thêm Gói Dịch Vụ Mới"}
        </CardTitle>
        {isEditing && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            title="Hủy chỉnh sửa"
          >
            <X className="h-6 w-6 text-gray-500" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {error && (
          <Alert variant="destructive" className="rounded-lg mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert className="rounded-lg bg-green-100 border-green-300 text-green-700 mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên Gói & Loại Xe */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label
                htmlFor="packageName"
                className="text-gray-600 font-medium"
              >
                Tên Gói
              </Label>
              <Input
                id="packageName"
                value={formData.packageName}
                onChange={(e) =>
                  setFormData({ ...formData, packageName: e.target.value })
                }
                required
                className="rounded-xl border-gray-200 shadow-md bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="vehicleType"
                className="text-gray-600 font-medium"
              >
                Loại Xe
              </Label>
              <Select
                value={formData.vehicleType}
                onValueChange={(v) =>
                  setFormData({ ...formData, vehicleType: v })
                }
                required
              >
                <SelectTrigger className="rounded-xl border-gray-200 shadow-md bg-white">
                  <SelectValue placeholder="Chọn loại xe" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {VEHICLE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Giá tiền và Đơn vị thời gian */}
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-1 col-span-2">
              <Label htmlFor="rate" className="text-gray-600 font-medium">
                Giá Tiền (VND)
              </Label>
              <Input
                id="rate"
                type="text"
                value={formatNumber(formData.rate)}
                onChange={(e) => handleRateChange(e.target.value)}
                required
                className="rounded-xl border-gray-200 shadow-md bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rateType" className="text-gray-600 font-medium">
                Đơn vị
              </Label>
              <Select
                value={formData.rateType}
                onValueChange={(v) => setFormData({ ...formData, rateType: v })}
                required
              >
                <SelectTrigger className="rounded-xl border-gray-200 shadow-md bg-white">
                  <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {SUBSCRIPTION_RATE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tải File */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="cardImage" className="text-gray-600 font-medium">
                {isEditing ? "Thay đổi Ảnh Card (Nếu cần)" : "Tải Ảnh Card"}
              </Label>
              <Input
                id="cardImage"
                type="file"
                accept="image/*"
                onChange={(e) => setCardImageFile(e.target.files[0])}
                className="rounded-xl border-gray-200 shadow-md bg-white file:bg-gray-100 file:text-gray-700"
              />
              {initialData?.cardImageUrl && !cardImageFile && (
                <p className="text-xs text-gray-400 mt-1">
                  Đang dùng ảnh cũ: ...{initialData.cardImageUrl.slice(-15)}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="detailImage"
                className="text-gray-600 font-medium"
              >
                {isEditing
                  ? "Thay đổi Ảnh Chi Tiết (Nếu cần)"
                  : "Tải Ảnh Chi Tiết"}
              </Label>
              <Input
                id="detailImage"
                type="file"
                accept="image/*"
                onChange={(e) => setDetailImageFile(e.target.files[0])}
                className="rounded-xl border-gray-200 shadow-md bg-white file:bg-gray-100 file:text-gray-700"
              />
              {initialData?.detailImageUrl && !detailImageFile && (
                <p className="text-xs text-gray-400 mt-1">
                  Đang dùng ảnh cũ: ...{initialData.detailImageUrl.slice(-15)}
                </p>
              )}
            </div>
          </div>

          {/* Mô tả */}
          <div className="space-y-1">
            <Label htmlFor="description" className="text-gray-600 font-medium">
              Mô tả Tóm tắt
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
              className="rounded-xl border-gray-200 shadow-md bg-white resize-none"
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="detailDescription"
              className="text-gray-600 font-medium"
            >
              Mô tả Chi tiết
            </Label>
            <Textarea
              id="detailDescription"
              value={formData.detailDescription}
              onChange={(e) =>
                setFormData({ ...formData, detailDescription: e.target.value })
              }
              rows={4}
              className="rounded-xl border-gray-200 shadow-md bg-white resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold rounded-xl shadow-lg mt-4 h-12 transition-all duration-300 flex items-center justify-center gap-2 ${
              isEditing
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                : "bg-purple-600 hover:bg-purple-700 shadow-purple-200"
            }`}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isEditing ? (
              "Lưu Thay Đổi"
            ) : (
              "Tạo Gói Mới"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default SubscriptionForm;
