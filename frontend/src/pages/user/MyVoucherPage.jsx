import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import VoucherCard from "@/components/user/VoucherCard"; // Đảm bảo đường dẫn này đúng
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Info, TicketPercent } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- ĐƯỜNG DẪN API ---
const API_AVAILABLE = "/api/vouchers/available";
const API_MINE = "/api/user/vouchers/mine";

const MyVoucherPage = () => {
  const [publicVouchers, setPublicVouchers] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm fetch dữ liệu voucher
  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Lấy cả 2 danh sách song song để tối ưu thời gian
      const [resPublic, resMine] = await Promise.all([
        axios.get(API_AVAILABLE),
        axios.get(API_MINE),
      ]);

      setPublicVouchers(resPublic.data);

      // 🔥 FRONTEND FAIL-SAFE: Lọc trùng lặp một lần nữa (đề phòng API chưa cập nhật hoặc lỗi cache)
      // Chỉ giữ lại các voucher có mã voucher._id duy nhất
      const uniqueMyVouchers = resMine.data.filter(
        (v, index, self) =>
          index === self.findIndex((t) => t.voucher?._id === v.voucher?._id)
      );
      setMyVouchers(uniqueMyVouchers);
    } catch (err) {
      console.error("Lỗi tải Voucher:", err);
      setError("Không thể tải dữ liệu Voucher. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi fetchVouchers khi component mount
  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // Xử lý khi User click vào Card (Mở Modal xem chi tiết - Hiện tại chỉ alert)
  const handleVoucherClick = (voucherData, isOwned) => {
    const code = isOwned ? voucherData.voucher?.code : voucherData.code;
    // Sau này bạn có thể thay alert bằng logic mở Modal chi tiết voucher
    alert(`Xem chi tiết Voucher: ${code || "N/A"}`);
  };

  // Component hiển thị Skeleton loading
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-[180px] rounded-2xl bg-gray-200" />
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <TicketPercent className="w-8 h-8 text-indigo-600" /> Ví Voucher Cá Nhân
      </h1>

      {/* Hiển thị thông báo lỗi nếu có */}
      {error && (
        <Alert
          variant="destructive"
          className="mb-6 rounded-xl border-red-200 bg-red-50 text-red-800"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* === 1. VOUCHER CÁ NHÂN (ĐÃ SỞ HỮU) === */}
      <Card className="rounded-2xl shadow-lg mb-8 border-none overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100">
          <CardTitle className="text-xl text-indigo-700 font-bold">
            Voucher Đã Sở Hữu ({myVouchers.length})
          </CardTitle>
        </CardHeader>
        <div className="p-6 bg-white">
          {loading ? (
            renderSkeletons()
          ) : myVouchers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myVouchers.map((item) => (
                <VoucherCard
                  key={item._id} // Sử dụng _id của UserVoucher làm key
                  voucher={item} // Truyền toàn bộ object UserVoucher (bao gồm thông tin voucher gốc trong .voucher)
                  isOwned={true}
                  onClick={() => handleVoucherClick(item.voucher, true)}
                />
              ))}
            </div>
          ) : (
            <Alert className="border-indigo-200 bg-indigo-50 text-indigo-800 rounded-xl flex items-start gap-3">
              <Info className="h-5 w-5 mt-0.5" />
              <div>
                <AlertTitle className="font-semibold">
                  Chưa có Voucher
                </AlertTitle>
                <AlertDescription>
                  Bạn chưa sở hữu bất kỳ Voucher nào. Hãy xem danh sách Voucher
                  chung bên dưới để săn ưu đãi nhé!
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </Card>

      {/* === 2. VOUCHER CHUNG (ĐỂ MUA / LẤY) === */}
      <Card className="rounded-2xl shadow-lg border-none overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100">
          <CardTitle className="text-xl text-gray-800 font-bold">
            Tất Cả Voucher Khả Dụng ({publicVouchers.length})
          </CardTitle>
        </CardHeader>
        <div className="p-6 bg-white">
          {loading ? (
            renderSkeletons()
          ) : publicVouchers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicVouchers.map((item) => (
                <VoucherCard
                  key={item._id}
                  voucher={item} // Truyền thông tin voucher gốc
                  isOwned={false}
                  onClick={() => handleVoucherClick(item, false)}
                />
              ))}
            </div>
          ) : (
            <Alert className="border-gray-200 bg-white rounded-xl flex items-start gap-3">
              <Info className="h-5 w-5 mt-0.5 text-gray-400" />
              <div>
                <AlertTitle className="font-semibold text-gray-700">
                  Không có voucher
                </AlertTitle>
                <AlertDescription className="text-gray-500">
                  Hiện tại không có Voucher nào đang hoạt động hoặc khả dụng.
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MyVoucherPage;
