import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Gift, Loader2 } from "lucide-react";

// Component Modal dùng để tặng Voucher cho User cụ thể
const GrantVoucherModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [vouchers, setVouchers] = useState([]); // Danh sách voucher có sẵn
  const [selectedVoucherId, setSelectedVoucherId] = useState(""); // Voucher được chọn
  const [loading, setLoading] = useState(false); // Trạng thái loading khi submit
  const [fetching, setFetching] = useState(false); // Trạng thái loading khi tải danh sách voucher

  // Effect: Tải danh sách voucher khi modal mở ra
  useEffect(() => {
    if (isOpen) {
      const fetchVouchers = async () => {
        setFetching(true);
        try {
          // Gọi API lấy danh sách voucher (Backend đã có sẵn API này)
          // Lưu ý: Chúng ta dùng API lấy voucher khả dụng (available) để tránh tặng voucher hết hạn
          const res = await axios.get("/api/vouchers/available");
          setVouchers(res.data);
        } catch (err) {
          console.error("Lỗi tải danh sách voucher:", err);
        } finally {
          setFetching(false);
        }
      };
      fetchVouchers();
      // Reset selection mỗi khi mở modal mới
      setSelectedVoucherId("");
    }
  }, [isOpen]);

  // Handler: Thực hiện tặng voucher
  const handleGrant = async () => {
    if (!selectedVoucherId || !user) return;

    setLoading(true);
    try {
      // Gọi API Backend để tặng (API chúng ta vừa thêm ở bước trước)
      await axios.post("/api/admin/vouchers/grant", {
        userId: user._id,
        voucherId: selectedVoucherId,
      });

      // Thông báo thành công (có thể thay bằng Toast nếu muốn đẹp hơn)
      alert(`✅ Đã tặng thành công cho ${user.name}!`);

      if (onSuccess) onSuccess(); // Callback để làm mới dữ liệu nếu cần
      onClose(); // Đóng modal
    } catch (err) {
      // Hiển thị lỗi từ Backend
      alert(
        "❌ Lỗi: " + (err.response?.data?.message || "Không thể tặng voucher")
      );
    } finally {
      setLoading(false);
    }
  };

  // Nếu không có user được chọn, không render gì cả
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-white rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-600 text-xl">
            <Gift className="w-6 h-6" /> Tặng Quà Cho User
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {/* Thông tin User đang được tặng */}
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-sm text-indigo-900">
            <div className="font-bold text-lg mb-1">{user.name}</div>
            <div className="opacity-80">{user.email}</div>
            {/* Hiển thị thêm thông tin Loyalty nếu có */}
            <div className="mt-2 pt-2 border-t border-indigo-200 flex justify-between text-xs">
              <span>Đã chi tiêu: {user.totalSpending?.toLocaleString()} đ</span>
              <span>Số lần đỗ: {user.parkingCount || 0}</span>
            </div>
          </div>

          {/* Dropdown chọn Voucher */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-semibold">
              Chọn Voucher để tặng
            </Label>
            {fetching ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tải danh
                sách...
              </div>
            ) : (
              <Select
                onValueChange={setSelectedVoucherId}
                value={selectedVoucherId}
              >
                <SelectTrigger className="w-full h-11 border-gray-300 focus:ring-indigo-500">
                  <SelectValue placeholder="-- Chọn một voucher --" />
                </SelectTrigger>
                <SelectContent>
                  {vouchers.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      Không có voucher nào khả dụng.
                    </div>
                  ) : (
                    vouchers.map((v) => (
                      <SelectItem key={v._id} value={v._id}>
                        <span className="font-bold mr-2 text-indigo-700">
                          {v.code}
                        </span>
                        <span className="text-gray-600">- {v.description}</span>
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 rounded">
                          {v.discountType === "PERCENTAGE"
                            ? `-${v.discountValue}%`
                            : `-${v.discountValue.toLocaleString()}đ`}
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleGrant}
            disabled={loading || !selectedVoucherId}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý
              </>
            ) : (
              "Xác nhận Tặng"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GrantVoucherModal;
