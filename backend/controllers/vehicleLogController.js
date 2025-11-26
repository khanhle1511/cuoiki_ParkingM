// import VehicleLog from "../models/VehicleLog.js";
// import ParkingSlot from "../models/ParkingSlot.js";
// import UserVoucher from "../models/UserVoucher.js";
// import Subscription from "../models/Subscription.js";
// import Voucher from "../models/Voucher.js";
// import User from "../models/User.js";

// // --- HÀM PHỤ TRỢ: XỬ LÝ TÍCH ĐIỂM & TỰ ĐỘNG TẶNG VOUCHER ---
// const processLoyaltyRewards = async (userId, feePaid) => {
//   try {
//     // 1. Cập nhật thông tin User (Atomic Update để tránh Race Condition)
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         $inc: {
//           totalSpending: feePaid,
//           parkingCount: 1,
//         },
//       },
//       { new: true }
//     );

//     if (!updatedUser) return;

//     console.log(
//       `🎁 Loyalty Update: ${updatedUser.name} | Spend: ${updatedUser.totalSpending} | Count: ${updatedUser.parkingCount}`
//     );

//     // 2. Tìm các Voucher có điều kiện thưởng
//     const rewardVouchers = await Voucher.find({
//       isActive: true,
//       triggerType: { $in: ["SPENDING_MILESTONE", "PARKING_COUNT_MILESTONE"] },
//       expirationDate: { $gt: new Date() },
//     });

//     // 3. Kiểm tra và Tặng quà
//     for (const v of rewardVouchers) {
//       let shouldReward = false;

//       // A. Điều kiện theo Tổng tiền chi tiêu
//       if (v.triggerType === "SPENDING_MILESTONE") {
//         if (updatedUser.totalSpending >= v.triggerValue) {
//           shouldReward = true;
//         }
//       }

//       // B. Điều kiện theo Số lần đỗ xe
//       if (v.triggerType === "PARKING_COUNT_MILESTONE") {
//         if (updatedUser.parkingCount >= v.triggerValue) {
//           shouldReward = true;
//         }
//       }

//       if (shouldReward) {
//         // 🔥 LOGIC CHẶN TRÙNG LẶP: Kiểm tra số lần đã nhận
//         const maxUsage = v.maxUsagePerUser || 1;

//         const countOwned = await UserVoucher.countDocuments({
//           user: userId,
//           voucher: v._id,
//         });

//         if (countOwned < maxUsage) {
//           // Kiểm tra kỹ lần cuối trước khi tạo để tránh Race Condition
//           const existing = await UserVoucher.findOne({
//             user: userId,
//             voucher: v._id,
//             // Thêm điều kiện createdAt gần đây nếu cần thiết để chặn spam
//           });

//           // Nếu chưa có (hoặc chưa đạt giới hạn), thì tạo mới
//           // Lưu ý: Logic này đơn giản hóa, nếu muốn chặt chẽ hơn cần dùng transaction
//           if (countOwned === 0 || !existing) {
//             await UserVoucher.create({
//               user: userId,
//               voucher: v._id,
//               status: "usable",
//               source: "system_reward",
//             });
//             console.log(`🎉 TẶNG THÀNH CÔNG: Voucher ${v.code}`);
//           }
//         }
//       }
//     }
//   } catch (err) {
//     console.error("❌ Loyalty Error:", err);
//   }
// };

// // --- 1. CHECK-IN ---
// export const checkIn = async (req, res) => {
//   const { vehicleType, parkingSlotId, licensePlate, notes } = req.body;
//   const userId = req.user._id;

//   // Kiểm tra xem User đã có xe đang gửi chưa
//   const activeLog = await VehicleLog.findOne({
//     user: userId,
//     status: "IN_PARK",
//   });

//   if (activeLog) {
//     return res.status(400).json({
//       message:
//         "Bạn đã có xe đang gửi trong bãi. Vui lòng Check-out trước khi gửi xe mới.",
//       activeLog: activeLog,
//     });
//   }

//   if (!vehicleType || !parkingSlotId || !licensePlate) {
//     return res.status(400).json({ message: "Thiếu thông tin gửi xe." });
//   }

//   try {
//     const slot = await ParkingSlot.findById(parkingSlotId);
//     if (!slot) {
//       return res.status(404).json({ message: "Không tìm thấy chỗ đỗ." });
//     }

//     const isMyBooking =
//       slot.status === "booked" &&
//       slot.currentBookingUser?.toString() === userId.toString();

//     if (slot.status !== "available" && !isMyBooking) {
//       return res.status(400).json({ message: "Chỗ đỗ này không khả dụng." });
//     }

//     const newLog = await VehicleLog.create({
//       user: userId,
//       vehicleType,
//       parkingSlot: parkingSlotId,
//       licensePlate: licensePlate.toUpperCase(),
//       checkInTime: new Date(),
//       status: "IN_PARK",
//       notes: notes || "",
//     });

//     slot.status = "occupied";
//     slot.currentLog = newLog._id;
//     slot.currentBookingUser = null;
//     await slot.save();

//     await newLog.populate("parkingSlot");

//     res.status(201).json({
//       message: "Check-in thành công!",
//       log: newLog,
//     });
//   } catch (error) {
//     console.error("CHECK-IN ERROR:", error);
//     res.status(500).json({ message: "Lỗi Server khi Check-in." });
//   }
// };

// // --- 2. GET ACTIVE LOG ---
// export const getActiveLog = async (req, res) => {
//   try {
//     const activeLog = await VehicleLog.findOne({
//       user: req.user._id,
//       status: "IN_PARK",
//     })
//       .populate("parkingSlot")
//       .sort({ createdAt: -1 });

//     if (!activeLog) {
//       return res.status(200).json(null);
//     }

//     res.status(200).json(activeLog);
//   } catch (error) {
//     console.error("GET ACTIVE LOG ERROR:", error);
//     res.status(500).json({ message: "Lỗi Server." });
//   }
// };

// // --- 3. CHECK-OUT (THANH TOÁN) ---
// // 🔥 ĐÃ CẬP NHẬT LOGIC TÍNH TOÁN CHÍNH XÁC
// export const checkoutParkingFee = async (req, res) => {
//   const { logId } = req.params;
//   const { discountId } = req.body; // ID của UserVoucher hoặc Subscription
//   const userId = req.user._id;

//   try {
//     // 1. Tìm bản ghi đỗ xe
//     const log = await VehicleLog.findById(logId);
//     if (!log || log.status !== "IN_PARK") {
//       return res.status(404).json({ message: "Phiên đỗ xe không hợp lệ." });
//     }

//     // 2. Tính phí gốc (BASE_FEE)
//     const checkOutTime = new Date();
//     const durationMs = checkOutTime - new Date(log.checkInTime);
//     const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

//     // MOCK: Lấy giá từ DB Pricing sẽ tốt hơn, tạm thời hardcode hoặc lấy từ config
//     let hourlyRate = 15000; // VNĐ/giờ

//     // Tính tiền: (Số giờ * Đơn giá)
//     // Nếu muốn tính block 30 phút hay 15 phút thì sửa logic ở đây
//     const BASE_FEE = durationHours * hourlyRate;

//     let finalFee = BASE_FEE;
//     let discountApplied = 0;
//     let discountDetails = { type: "none", id: null };

//     // 3. Áp dụng Ưu đãi (Nếu có chọn)
//     if (discountId && discountId !== "none") {
//       // Thử tìm trong Subscription
//       const selectedSub = await Subscription.findById(discountId).populate(
//         "pricing"
//       );

//       // Thử tìm trong UserVoucher
//       const selectedVoucher = await UserVoucher.findById(discountId).populate(
//         "voucher"
//       );

//       // A. Xử lý Subscription (Gói thành viên)
//       if (
//         selectedSub &&
//         selectedSub.status === "Active" &&
//         selectedSub.user.toString() === userId.toString()
//       ) {
//         discountApplied = BASE_FEE; // Miễn phí 100%
//         finalFee = 0;
//         discountDetails = { type: "Subscription", id: selectedSub._id };
//       }

//       // B. Xử lý Voucher (Giảm giá)
//       else if (
//         selectedVoucher &&
//         selectedVoucher.status === "usable" &&
//         selectedVoucher.user.toString() === userId.toString()
//       ) {
//         const voucherInfo = selectedVoucher.voucher; // Lấy thông tin gốc từ bảng Voucher
//         let calculatedDiscount = 0;

//         if (voucherInfo) {
//           // --- LOGIC TÍNH TOÁN MỚI ---
//           if (voucherInfo.discountType === "PERCENTAGE") {
//             // Tính %: (Giá gốc * % giảm) / 100
//             calculatedDiscount = (BASE_FEE * voucherInfo.discountValue) / 100;

//             // Kiểm tra giới hạn tối đa
//             if (voucherInfo.maxDiscountAmount > 0) {
//               calculatedDiscount = Math.min(
//                 calculatedDiscount,
//                 voucherInfo.maxDiscountAmount
//               );
//             }
//           } else if (voucherInfo.discountType === "FIXED") {
//             // Giảm tiền mặt trực tiếp
//             calculatedDiscount = voucherInfo.discountValue;
//           }

//           // Đảm bảo không giảm âm tiền
//           discountApplied = Math.min(calculatedDiscount, BASE_FEE);
//           finalFee = BASE_FEE - discountApplied;

//           discountDetails = { type: "Voucher", id: selectedVoucher._id };

//           // Đánh dấu voucher đã dùng
//           selectedVoucher.status = "used";
//           await selectedVoucher.save();

//           // Tăng bộ đếm sử dụng chung của Voucher gốc
//           voucherInfo.usedCount += 1;
//           await voucherInfo.save();
//         }
//       }
//     }
//     const updatedLog = await VehicleLog.findOneAndUpdate(
//       { _id: logId, status: "IN_PARK" }, // Điều kiện khóa
//       {
//         $set: {
//           status: "CHECKED_OUT",
//           checkOutTime: checkOutTime,
//           totalFee: finalFee,
//           discountApplied: discountApplied,
//           discountDetails: discountDetails,
//         },
//       },
//       { new: true }
//     );

//     if (!updatedLog) {
//       // Nếu vào đây nghĩa là request khác đã thanh toán xong trước đó 1ms
//       // Trả về thành công giả hoặc lỗi để Frontend biết
//       return res
//         .status(400)
//         .json({ message: "Giao dịch đang xử lý hoặc đã hoàn tất." });
//     }

//     // 5. Cập nhật Voucher/Subscription nếu có (Chỉ chạy khi updateLog thành công)
//     if (discountDetails.type === "Voucher" && discountDetails.id) {
//       await UserVoucher.findByIdAndUpdate(discountDetails.id, {
//         status: "used",
//       });
//       // Tăng count usage voucher gốc (optional)
//       const vData = await UserVoucher.findById(discountDetails.id).populate(
//         "voucher"
//       );
//       if (vData && vData.voucher) {
//         await Voucher.findByIdAndUpdate(vData.voucher._id, {
//           $inc: { usedCount: 1 },
//         });
//       }
//     }

//     // 6. Cập nhật Slot (Giải phóng chỗ)
//     await ParkingSlot.findByIdAndUpdate(updatedLog.parkingSlot, {
//       status: "available",
//       currentLog: null,
//       currentBookingUser: null,
//     });

//     // 7. Tặng quà (Chỉ chạy 1 lần vì chỉ có 1 request lọt vào được bước 4)
//     // Không cần await để trả về phản hồi nhanh hơn cho User
//     processLoyaltyRewards(userId, finalFee);

//     res.json({
//       message: "Thanh toán thành công!",
//       baseFee: BASE_FEE,
//       finalFee: finalFee,
//       discount: discountApplied,
//       log: updatedLog,
//     });
//   } catch (error) {
//     console.error("Lỗi Check-out:", error);
//     res.status(500).json({ message: "Lỗi Server khi xử lý check-out." });
//   }
// };
import VehicleLog from "../models/VehicleLog.js";
import ParkingSlot from "../models/ParkingSlot.js";
import UserVoucher from "../models/UserVoucher.js";
import Subscription from "../models/Subscription.js";
import Voucher from "../models/Voucher.js";
import User from "../models/User.js";
import appEvents from "../utils/eventEmitter.js";
import { EVENTS } from "../services/notificationService.js";

// --- HÀM PHỤ TRỢ: XỬ LÝ TÍCH ĐIỂM & TỰ ĐỘNG TẶNG VOUCHER ---
const processLoyaltyRewards = async (userId, feePaid) => {
  try {
    // 1. Cộng điểm cho User (Atomic Update để tránh Race Condition)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          totalSpending: feePaid,
          parkingCount: 1,
        },
      },
      { new: true }
    );

    if (!updatedUser) return;

    console.log(
      `🎁 Loyalty Update: ${updatedUser.name} | Spend: ${updatedUser.totalSpending} | Count: ${updatedUser.parkingCount}`
    );

    // 2. Tìm các Voucher có điều kiện thưởng
    const rewardVouchers = await Voucher.find({
      isActive: true,
      triggerType: { $in: ["SPENDING_MILESTONE", "PARKING_COUNT_MILESTONE"] },
      expirationDate: { $gt: new Date() },
    });

    // 3. Kiểm tra và Tặng quà
    for (const v of rewardVouchers) {
      let shouldReward = false;

      // A. Điều kiện theo Tổng tiền chi tiêu
      if (v.triggerType === "SPENDING_MILESTONE") {
        if (updatedUser.totalSpending >= v.triggerValue) {
          shouldReward = true;
        }
      }

      // B. Điều kiện theo Số lần đỗ xe
      if (v.triggerType === "PARKING_COUNT_MILESTONE") {
        if (updatedUser.parkingCount >= v.triggerValue) {
          shouldReward = true;
        }
      }

      if (shouldReward) {
        // 🔥 LOGIC CHẶN TRÙNG LẶP: Kiểm tra số lần đã nhận
        const maxUsage = v.maxUsagePerUser || 1;

        const countOwned = await UserVoucher.countDocuments({
          user: userId,
          voucher: v._id,
        });

        if (countOwned < maxUsage) {
          try {
            // Chỉ tạo nếu chưa đạt giới hạn
            await UserVoucher.create({
              user: userId,
              voucher: v._id,
              status: "usable",
              source: "system_reward",
            });
            // ⭐ BƯỚC MỚI: PHÁT SỰ KIỆN TẶNG VOUCHER TỰ ĐỘNG
            appEvents.emit(EVENTS.VOUCHER_GRANTED, {
              user: userId,
              voucher: v, // Voucher Model
              source: "system_reward",
            });
            console.log(`🎉 TẶNG THÀNH CÔNG: Voucher ${v.code}`);
          } catch (e) {
            // Bỏ qua lỗi duplicate key (E11000) nếu bị race condition ở đây
            if (e.code !== 11000)
              console.error("Lỗi tạo voucher (Race Condition):", e);
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ Loyalty Error:", err);
  }
};

// --- 1. CHECK-IN ---
export const checkIn = async (req, res) => {
  const { vehicleType, parkingSlotId, licensePlate, notes } = req.body;
  const userId = req.user._id;

  // Kiểm tra xem User đã có xe đang gửi chưa
  const activeLog = await VehicleLog.findOne({
    user: userId,
    status: "IN_PARK",
  });

  if (activeLog) {
    return res.status(400).json({
      message:
        "Bạn đã có xe đang gửi trong bãi. Vui lòng Check-out trước khi gửi xe mới.",
      activeLog: activeLog,
    });
  }

  if (!vehicleType || !parkingSlotId || !licensePlate) {
    return res.status(400).json({ message: "Thiếu thông tin gửi xe." });
  }

  try {
    const slot = await ParkingSlot.findById(parkingSlotId);
    if (!slot) {
      return res.status(404).json({ message: "Không tìm thấy chỗ đỗ." });
    }

    const isMyBooking =
      slot.status === "booked" &&
      slot.currentBookingUser?.toString() === userId.toString();

    if (slot.status !== "available" && !isMyBooking) {
      return res.status(400).json({ message: "Chỗ đỗ này không khả dụng." });
    }

    const newLog = await VehicleLog.create({
      user: userId,
      vehicleType,
      parkingSlot: parkingSlotId,
      licensePlate: licensePlate.toUpperCase(),
      checkInTime: new Date(),
      status: "IN_PARK",
      notes: notes || "",
    });

    slot.status = "occupied";
    slot.currentLog = newLog._id;
    slot.currentBookingUser = null;
    await slot.save();

    await newLog.populate("parkingSlot");

    res.status(201).json({
      message: "Check-in thành công!",
      log: newLog,
    });
  } catch (error) {
    console.error("CHECK-IN ERROR:", error);
    res.status(500).json({ message: "Lỗi Server khi Check-in." });
  }
};

// --- 2. GET ACTIVE LOG ---
export const getActiveLog = async (req, res) => {
  try {
    const activeLog = await VehicleLog.findOne({
      user: req.user._id,
      status: "IN_PARK",
    })
      .populate("parkingSlot")
      .sort({ createdAt: -1 });

    if (!activeLog) {
      return res.status(200).json(null);
    }

    res.status(200).json(activeLog);
  } catch (error) {
    console.error("GET ACTIVE LOG ERROR:", error);
    res.status(500).json({ message: "Lỗi Server." });
  }
};

// --- 3. CHECK-OUT (THANH TOÁN) ---
export const checkoutParkingFee = async (req, res) => {
  const { logId } = req.params;
  const { discountId } = req.body;
  const userId = req.user._id;

  try {
    // 1. Lấy thông tin sơ bộ để tính tiền (Dùng logPreview)
    const logPreview = await VehicleLog.findById(logId);
    if (!logPreview || logPreview.status !== "IN_PARK") {
      return res
        .status(400)
        .json({ message: "Phiên đỗ xe không hợp lệ hoặc đã thanh toán." });
    }

    // 2. 🔥 TÍNH TOÁN PHÍ GỐC (LOGIC MỚI: LÀM TRÒN LÊN) 🔥
    const checkOutTime = new Date();
    const durationMs = checkOutTime - new Date(logPreview.checkInTime);

    // Chia cho số mili-giây trong 1 giờ (1000 * 60 * 60 = 3600000)
    // Math.ceil: Làm tròn lên. Ví dụ 0.1 giờ -> 1 giờ. 1.1 giờ -> 2 giờ.
    let durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

    // 🛑 Đảm bảo tối thiểu là 1 giờ (dù chỉ đỗ 1 giây)
    if (durationHours < 1) durationHours = 1;

    // MOCK: Lấy giá từ DB Pricing sẽ tốt hơn, tạm thời hardcode
    let hourlyRate = 15000; // VNĐ/giờ

    const BASE_FEE = durationHours * hourlyRate;

    let finalFee = BASE_FEE;
    let discountApplied = 0;
    let discountDetails = { type: "none", id: null };

    // 3. Xử lý Ưu đãi (Tính toán số tiền giảm)
    if (discountId && discountId !== "none") {
      const selectedSub = await Subscription.findById(discountId).populate(
        "pricing"
      );
      const selectedVoucher = await UserVoucher.findById(discountId).populate(
        "voucher"
      );

      // A. Subscription
      const now = new Date();
      const isSubscriptionValid =
        selectedSub &&
        selectedSub.status === "Active" &&
        new Date(selectedSub.endDate) > now;

      if (
        isSubscriptionValid &&
        selectedSub.user.toString() === userId.toString()
      ) {
        discountApplied = BASE_FEE;
        finalFee = 0;
        discountDetails = { type: "Subscription", id: selectedSub._id };
      }

      // B. Voucher
      else if (
        selectedVoucher &&
        selectedVoucher.status === "usable" &&
        selectedVoucher.user.toString() === userId.toString()
      ) {
        const voucherInfo = selectedVoucher.voucher;
        let calculatedDiscount = 0;

        if (voucherInfo) {
          if (voucherInfo.discountType === "PERCENTAGE") {
            calculatedDiscount = (BASE_FEE * voucherInfo.discountValue) / 100;
            if (voucherInfo.maxDiscountAmount > 0) {
              calculatedDiscount = Math.min(
                calculatedDiscount,
                voucherInfo.maxDiscountAmount
              );
            }
          } else if (voucherInfo.discountType === "FIXED") {
            calculatedDiscount = voucherInfo.discountValue;
          }

          discountApplied = Math.min(calculatedDiscount, BASE_FEE);
          finalFee = BASE_FEE - discountApplied;
          discountDetails = { type: "Voucher", id: selectedVoucher._id };
        }
      }
    }

    // 🔥 4. ATOMIC UPDATE (Xử lý Check-out) 🔥
    const updatedLog = await VehicleLog.findOneAndUpdate(
      { _id: logId, status: "IN_PARK" }, // Điều kiện khóa
      {
        $set: {
          status: "CHECKED_OUT",
          checkOutTime: checkOutTime,
          totalFee: finalFee, // Trường code cũ
          totalAmount: finalFee, // ⭐ THÊM TRƯỜNG NÀY: Để khớp với DB của bạn
          discountApplied: discountApplied,
          discountDetails: discountDetails,
        },
      },
      { new: true }
    );

    if (!updatedLog) {
      return res
        .status(400)
        .json({ message: "Giao dịch đang xử lý hoặc đã hoàn tất." });
    }

    // 5. Cập nhật trạng thái Voucher và Slot
    if (discountDetails.type === "Voucher" && discountDetails.id) {
      await UserVoucher.findByIdAndUpdate(discountDetails.id, {
        status: "used",
      });

      const vData = await UserVoucher.findById(discountDetails.id).populate(
        "voucher"
      );
      if (vData && vData.voucher) {
        await Voucher.findByIdAndUpdate(vData.voucher._id, {
          $inc: { usedCount: 1 },
        });
      }
    }

    // 6. Giải phóng Slot
    await ParkingSlot.findByIdAndUpdate(updatedLog.parkingSlot, {
      status: "available",
      currentLog: null,
      currentBookingUser: null,
    });

    // 7. Tặng quà (Loyalty)
    processLoyaltyRewards(userId, finalFee);
    const logWithSlot = await updatedLog.populate("parkingSlot");

    appEvents.emit(EVENTS.PARKING_CHECKOUT, {
      user: userId,
      log: logWithSlot,
      fee: finalFee,
      timeOut: checkOutTime,
    });
    res.json({
      message: "Thanh toán thành công!",
      baseFee: BASE_FEE,
      finalFee: finalFee,
      discount: discountApplied,
      log: updatedLog,
    });
  } catch (error) {
    console.error("Lỗi Check-out:", error);
    res.status(500).json({ message: "Lỗi Server khi xử lý check-out." });
  }
};
