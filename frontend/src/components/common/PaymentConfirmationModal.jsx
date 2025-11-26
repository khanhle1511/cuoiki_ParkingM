// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { X, Car, DollarSign, Zap, Ticket } from "lucide-react";
// import DiscountSelection from "./DiscountSelection";

// // --- Hằng số và API Endpoints ---
// const formatCurrency = (amount) => {
//   return amount ? amount.toLocaleString("vi-VN") + " VNĐ" : "0 VNĐ";
// };

// const formatRateType = (rateType, durationValue) => {
//   if (!rateType) return "";
//   let unit = rateType
//     .replace("Monthly", "tháng")
//     .replace("Daily", "ngày")
//     .replace("HalfMonthly", "nửa tháng");
//   return `${durationValue} ${unit}`;
// };

// const API_VOUCHER_MINE = "/api/user/vouchers/mine";
// const API_SUB_MINE = "/api/subscriptions/mine";

// // 🔥 HÀM TÍNH TOÁN GIẢM GIÁ
// const calculateDiscount = (
//   basePrice,
//   selectedDiscount,
//   vouchers,
//   subscriptions
// ) => {
//   let discountAmount = 0;
//   let discountLabel = "";
//   const now = new Date(); // Lấy thời điểm hiện tại

//   if (!selectedDiscount || selectedDiscount.type === "none") {
//     return { finalPrice: basePrice, discountAmount: 0, discountLabel: "" };
//   }

//   // 1. Xử lý Voucher (Logic giữ nguyên)
//   if (selectedDiscount.type === "voucher") {
//     // ... (Logic Voucher giữ nguyên)
//     const voucherData = vouchers.find((v) => v._id === selectedDiscount.id);
//     const voucherInfo = voucherData?.voucher;

//     if (voucherInfo) {
//       if (voucherInfo.discountType === "PERCENTAGE") {
//         discountAmount = (basePrice * voucherInfo.discountValue) / 100;
//         discountLabel = `${voucherInfo.discountValue}%`;

//         if (voucherInfo.maxDiscountAmount > 0) {
//           if (discountAmount > voucherInfo.maxDiscountAmount) {
//             discountAmount = voucherInfo.maxDiscountAmount;
//             discountLabel += ` (Tối đa ${formatCurrency(
//               voucherInfo.maxDiscountAmount
//             )})`;
//           }
//         }
//       } else if (voucherInfo.discountType === "FIXED") {
//         discountAmount = voucherInfo.discountValue;
//         discountLabel = formatCurrency(discountAmount);
//       }
//     }
//   }

//   // 2. Xử lý Subscription (Gói ưu đãi)
//   if (selectedDiscount.type === "subscription") {
//     const sub = subscriptions.find((s) => s._id === selectedDiscount.id);

//     // 🔥 QUAN TRỌNG: Chỉ áp dụng nếu status là Active và CHƯA HẾT HẠN
//     // Giả định trường expirationDate nằm trong sub
//     const isSubscriptionValid = sub && sub.status === "Active" && new Date(sub.expirationDate) > now;

//     if (isSubscriptionValid) {
//       discountAmount = basePrice;
//       discountLabel = "Miễn phí (Gói thành viên)";
//     } else if (sub) {
//         // Nếu gói bị hết hạn hoặc không active, reset giảm giá
//         console.warn("Gói ưu đãi không hợp lệ/đã hết hạn. Không áp dụng giảm giá.");
//         // Nếu không hợp lệ, ta không giảm, nhưng vẫn tính BASE_FEE
//         discountAmount = 0;
//         discountLabel = "Không áp dụng";
//     }
//   }

//   // Đảm bảo không giảm quá số tiền gốc
//   discountAmount = Math.min(discountAmount, basePrice);
//   discountAmount = Math.round(discountAmount);

//   const finalPrice = Math.max(0, basePrice - discountAmount);

//   return { finalPrice, discountAmount, discountLabel };
// };

// const PaymentConfirmationModal = ({
//   pkg,
//   parkingData,
//   onClose,
//   onConfirmPayment,
//   isProcessing,
// }) => {
//   const [myVouchers, setMyVouchers] = useState([]);
//   const [mySubscriptions, setMySubscriptions] = useState([]);
//   const [loadingData, setLoadingData] = useState(true);

//   const [selectedDiscount, setSelectedDiscount] = useState({
//     type: "none",
//     id: "none",
//   });

//   const basePrice = pkg ? pkg.rate : parkingData?.totalAmount || 0;

//   // Tính toán giá và label hiển thị mỗi khi chọn ưu đãi khác
//   const { finalPrice, discountAmount, discountLabel } = calculateDiscount(
//     basePrice,
//     selectedDiscount,
//     myVouchers,
//     mySubscriptions
//   );

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoadingData(true);
//       try {
//         const [vouchersRes, subsRes] = await Promise.all([
//           axios.get(API_VOUCHER_MINE),
//           axios.get(API_SUB_MINE),
//         ]);

//         // Lọc Voucher theo ID Voucher gốc (FIX LỖI TRÙNG LẶP)
//         const uniqueVouchersMap = new Map();
//         vouchersRes.data.filter((v) => v.status === "usable")
//            .forEach(v => {
//               if (v.voucher?._id && !uniqueVouchersMap.has(v.voucher._id.toString())) {
//                   uniqueVouchersMap.set(v.voucher._id.toString(), v);
//               }
//            });
//         setMyVouchers(Array.from(uniqueVouchersMap.values()));

//         // Lọc Subscriptions: Chỉ lấy Active và chưa hết hạn để hiển thị
//         const now = new Date();
//         const validSubscriptions = subsRes.data.filter(s => {
//              // Giả định trường kết thúc gói là expirationDate
//              const expiry = new Date(s.expirationDate);
//              return (s.status === "Active" || s.status === "Pending") && expiry > now;
//         });
//         setMySubscriptions(validSubscriptions);

//         // 🔥 KHỞI TẠO: Nếu có gói ưu đãi hợp lệ, tự động chọn gói đó (nếu là thanh toán phí đỗ xe)
//         if (!pkg && validSubscriptions.length > 0) {
//             // Tự động chọn gói đầu tiên
//              setSelectedDiscount({ type: "subscription", id: validSubscriptions[0]._id });
//         }

//       } catch (error) {
//         console.error("Lỗi tải dữ liệu ưu đãi:", error);
//       } finally {
//         setLoadingData(false);
//       }
//     };
//     fetchData();
//   }, []);

//   if (!pkg && !parkingData) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
//         {/* Header Mobile */}
//         <div className="flex justify-between items-center p-4 border-b lg:hidden">
//           <h3 className="font-bold text-lg">Thanh toán</h3>
//           <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
//             <X size={20} />
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto lg:overflow-hidden">
//           <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
//             {/* CỘT TRÁI: CHỌN ƯU ĐÃI */}
//             <div className="lg:col-span-3 p-6 lg:p-8 bg-gray-50/50 overflow-y-auto custom-scrollbar">
//               <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
//                 <DollarSign className="w-6 h-6 text-indigo-600" /> Chi tiết
//                 thanh toán
//               </h3>
//               <p className="text-sm text-gray-500 mb-6">
//                 Chọn gói ưu đãi hoặc voucher để áp dụng giảm giá.
//               </p>

//               <DiscountSelection
//                 vouchers={myVouchers}
//                 subscriptions={mySubscriptions}
//                 selectedDiscount={selectedDiscount}
//                 onSelectDiscount={setSelectedDiscount}
//                 isLoading={loadingData}
//               />
//             </div>

//             {/* CỘT PHẢI: TÓM TẮT */}
//             <div className="lg:col-span-2 p-6 lg:p-8 bg-white flex flex-col h-full border-l border-gray-100 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] relative">
//               {/* Nút đóng */}
//               <button
//                 onClick={onClose}
//                 className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hidden lg:block p-2 hover:bg-gray-100 rounded-full transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </button>

//               <h3 className="text-xl font-bold text-gray-800 mb-6">
//                 Tóm tắt Đơn hàng
//               </h3>

//               <div className="flex-1 space-y-6">
//                 {/* Chi tiết đỗ xe */}
//                 {parkingData && (
//                   <div className="space-y-3">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Biển số xe</span>
//                       <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
//                         {parkingData.licensePlate}
//                       </span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Giờ vào</span>
//                       <span className="font-medium">
//                         {new Date(parkingData.entryTime).toLocaleTimeString(
//                           "vi-VN"
//                         )}
//                       </span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Thời gian</span>
//                       <span className="font-medium">
//                         {parkingData.duration} giờ
//                       </span>
//                     </div>
//                     <div className="flex justify-between text-base pt-2 border-t border-dashed border-gray-200">
//                       <span className="font-medium text-gray-700">
//                         Tạm tính
//                       </span>
//                       <span className="font-bold text-gray-900">
//                         {formatCurrency(parkingData.totalAmount)}
//                       </span>
//                     </div>
//                   </div>
//                 )}

//                 {/* Chi tiết gói dịch vụ */}
//                 {pkg && (
//                   <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
//                     <div className="flex items-start gap-3">
//                       <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
//                         {pkg.type === "Car" ? (
//                           <Car size={20} />
//                         ) : (
//                           <Zap size={20} />
//                         )}
//                       </div>
//                       <div>
//                         <p className="font-bold text-indigo-900">{pkg.name}</p>
//                         <p className="text-xs text-indigo-600/80 mt-0.5">
//                           Thời hạn:{" "}
//                           {formatRateType(pkg.rateType, pkg.durationValue)}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Footer tính tiền */}
//               <div className="mt-auto pt-6 border-t border-gray-100 space-y-3">
//                 <div className="flex justify-between text-sm text-gray-600">
//                   <span>Giá trị đơn hàng</span>
//                   <span>{formatCurrency(basePrice)}</span>
//                 </div>

//                 {discountAmount > 0 && (
//                   <div className="flex justify-between text-sm font-medium text-green-600 animate-in slide-in-from-right-5 fade-in">
//                     <span className="flex items-center gap-1">
//                       <Ticket size={14} /> Giảm giá
//                       <span className="text-xs bg-green-100 px-1 rounded ml-1">
//                         {discountLabel}
//                       </span>
//                     </span>
//                     <span>- {formatCurrency(discountAmount)}</span>
//                   </div>
//                 )}

//                 <div className="flex justify-between items-end pt-2">
//                   <span className="font-bold text-gray-800">
//                     Tổng thanh toán
//                   </span>
//                   <div className="text-right">
//                     <span className="block text-2xl font-extrabold text-indigo-600 leading-none">
//                       {formatCurrency(finalPrice)}
//                     </span>
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => onConfirmPayment(selectedDiscount.id)}
//                   disabled={isProcessing || loadingData}
//                   className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-indigo-200
//                            bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700
//                            active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
//                 >
//                   {isProcessing ? (
//                     <>
//                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                       Đang xử lý...
//                     </>
//                   ) : (
//                     `Thanh toán ngay • ${formatCurrency(finalPrice)}`
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentConfirmationModal;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Car, DollarSign, Zap, Ticket } from "lucide-react";
import DiscountSelection from "./DiscountSelection";

// --- Helper Functions ---
const formatCurrency = (amount) => {
  return amount ? amount.toLocaleString("vi-VN") + " VNĐ" : "0 VNĐ";
};

const formatRateType = (rateType, durationValue) => {
  if (!rateType) return "";
  let unit = rateType
    .replace("Monthly", "tháng")
    .replace("Daily", "ngày")
    .replace("HalfMonthly", "nửa tháng");
  return `${durationValue} ${unit}`;
};

const API_VOUCHER_MINE = "/api/user/vouchers/mine";
const API_SUB_MINE = "/api/subscriptions/mine";

// 🔥 HÀM TÍNH TOÁN GIẢM GIÁ
const calculateDiscount = (
  basePrice,
  selectedDiscount,
  vouchers,
  subscriptions
) => {
  let discountAmount = 0;
  let discountLabel = "";
  const now = new Date();

  if (!selectedDiscount || selectedDiscount.type === "none") {
    return { finalPrice: basePrice, discountAmount: 0, discountLabel: "" };
  }

  // 1. Xử lý Voucher
  if (selectedDiscount.type === "voucher") {
    const voucherData = vouchers.find((v) => v._id === selectedDiscount.id);
    const voucherInfo = voucherData?.voucher;

    if (voucherInfo) {
      if (voucherInfo.discountType === "PERCENTAGE") {
        discountAmount = (basePrice * voucherInfo.discountValue) / 100;
        discountLabel = `${voucherInfo.discountValue}%`;

        if (voucherInfo.maxDiscountAmount > 0) {
          if (discountAmount > voucherInfo.maxDiscountAmount) {
            discountAmount = voucherInfo.maxDiscountAmount;
            discountLabel += ` (Tối đa ${formatCurrency(
              voucherInfo.maxDiscountAmount
            )})`;
          }
        }
      } else if (voucherInfo.discountType === "FIXED") {
        discountAmount = voucherInfo.discountValue;
        discountLabel = formatCurrency(discountAmount);
      }
    }
  }

  // 2. Xử lý Subscription (Chỉ áp dụng cho Check-out)
  if (selectedDiscount.type === "subscription") {
    const sub = subscriptions.find((s) => s._id === selectedDiscount.id);

    const isSubscriptionValid =
      sub && sub.status === "Active" && new Date(sub.endDate) > now;

    if (isSubscriptionValid) {
      discountAmount = basePrice; // Miễn phí 100%
      discountLabel = "Miễn phí (Gói thành viên)";
    } else if (sub) {
      discountAmount = 0;
      discountLabel = "Gói hết hạn";
    }
  }

  discountAmount = Math.min(discountAmount, basePrice);
  discountAmount = Math.round(discountAmount);

  const finalPrice = Math.max(0, basePrice - discountAmount);

  return { finalPrice, discountAmount, discountLabel };
};

const PaymentConfirmationModal = ({
  pkg, // Có giá trị khi Mua gói
  parkingData, // Có giá trị khi Check-out
  onClose,
  onConfirmPayment,
  isProcessing,
}) => {
  const [myVouchers, setMyVouchers] = useState([]);
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedDiscount, setSelectedDiscount] = useState({
    type: "none",
    id: "none",
  });

  const basePrice = pkg ? pkg.rate : parkingData?.totalAmount || 0;

  const { finalPrice, discountAmount, discountLabel } = calculateDiscount(
    basePrice,
    selectedDiscount,
    myVouchers,
    mySubscriptions
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // 1. Luôn lấy Voucher (User có thể dùng voucher giảm giá khi mua gói)
        const vouchersPromise = axios.get(API_VOUCHER_MINE);

        // 2. 🔥 FIX: Chỉ lấy Subscription nếu đang CHECK-OUT (có parkingData)
        // Nếu đang mua gói (pkg), ta trả về mảng rỗng để ẩn khối này đi
        const subsPromise = parkingData
          ? axios.get(API_SUB_MINE)
          : Promise.resolve({ data: [] });

        const [vouchersRes, subsRes] = await Promise.all([
          vouchersPromise,
          subsPromise,
        ]);

        // --- Xử lý Voucher ---
        const uniqueVouchersMap = new Map();
        vouchersRes.data
          .filter((v) => v.status === "usable")
          .forEach((v) => {
            if (
              v.voucher?._id &&
              !uniqueVouchersMap.has(v.voucher._id.toString())
            ) {
              uniqueVouchersMap.set(v.voucher._id.toString(), v);
            }
          });
        setMyVouchers(Array.from(uniqueVouchersMap.values()));

        // --- Xử lý Subscription (Sẽ rỗng nếu đang mua gói) ---
        const now = new Date();
        const validSubscriptions = subsRes.data.filter((s) => {
          const expiry = new Date(s.endDate);
          return (
            (s.status === "Active" || s.status === "Pending") && expiry > now
          );
        });
        setMySubscriptions(validSubscriptions);

        // Tự động chọn gói ưu đãi nếu đang check-out
        if (parkingData && validSubscriptions.length > 0) {
          setSelectedDiscount({
            type: "subscription",
            id: validSubscriptions[0]._id,
          });
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu ưu đãi:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [parkingData, pkg]); // Thêm dependencies

  if (!pkg && !parkingData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Mobile */}
        <div className="flex justify-between items-center p-4 border-b lg:hidden">
          <h3 className="font-bold text-lg">Thanh toán</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto lg:overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
            {/* CỘT TRÁI: CHỌN ƯU ĐÃI */}
            <div className="lg:col-span-3 p-6 lg:p-8 bg-gray-50/50 overflow-y-auto custom-scrollbar">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                <DollarSign className="w-6 h-6 text-indigo-600" /> Chi tiết
                thanh toán
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Chọn gói ưu đãi hoặc voucher để áp dụng giảm giá.
              </p>

              <DiscountSelection
                vouchers={myVouchers}
                subscriptions={mySubscriptions} // Mảng này sẽ rỗng khi mua gói -> Khối Subscription tự ẩn
                selectedDiscount={selectedDiscount}
                onSelectDiscount={setSelectedDiscount}
                isLoading={loadingData}
              />
            </div>

            {/* CỘT PHẢI: TÓM TẮT */}
            <div className="lg:col-span-2 p-6 lg:p-8 bg-white flex flex-col h-full border-l border-gray-100 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hidden lg:block p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Tóm tắt Đơn hàng
              </h3>

              <div className="flex-1 space-y-6">
                {/* Chi tiết đỗ xe */}
                {parkingData && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Biển số xe</span>
                      <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                        {parkingData.licensePlate}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Giờ vào</span>
                      <span className="font-medium">
                        {new Date(parkingData.entryTime).toLocaleTimeString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Thời gian</span>
                      <span className="font-medium">
                        {parkingData.duration} giờ
                      </span>
                    </div>
                    <div className="flex justify-between text-base pt-2 border-t border-dashed border-gray-200">
                      <span className="font-medium text-gray-700">
                        Tạm tính
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(parkingData.totalAmount)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Chi tiết gói dịch vụ */}
                {pkg && (
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                        {pkg.type === "Car" ? (
                          <Car size={20} />
                        ) : (
                          <Zap size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-indigo-900">{pkg.name}</p>
                        <p className="text-xs text-indigo-600/80 mt-0.5">
                          Thời hạn:{" "}
                          {formatRateType(pkg.rateType, pkg.durationValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer tính tiền */}
              <div className="mt-auto pt-6 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Giá trị đơn hàng</span>
                  <span>{formatCurrency(basePrice)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm font-medium text-green-600 animate-in slide-in-from-right-5 fade-in">
                    <span className="flex items-center gap-1">
                      <Ticket size={14} /> Giảm giá
                      <span className="text-xs bg-green-100 px-1 rounded ml-1">
                        {discountLabel}
                      </span>
                    </span>
                    <span>- {formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-end pt-2">
                  <span className="font-bold text-gray-800">
                    Tổng thanh toán
                  </span>
                  <div className="text-right">
                    <span className="block text-2xl font-extrabold text-indigo-600 leading-none">
                      {formatCurrency(finalPrice)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onConfirmPayment(selectedDiscount.id)}
                  disabled={isProcessing || loadingData}
                  className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-indigo-200
                           bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                           active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    `Thanh toán ngay • ${formatCurrency(finalPrice)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;
