import mongoose from "mongoose";

const vehicleLogSchema = new mongoose.Schema(
  {
    // Liên kết đến người dùng đã gửi xe
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Tham chiếu đến model 'User'
    },
    // Loại xe
    vehicleType: {
      type: String,
      required: true,
      enum: ["motorbike", "car", "bicycle"],
    },
    // === 🚀 ĐÃ THÊM: Liên kết đến chỗ đỗ ===
    parkingSlot: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "ParkingSlot", // Tham chiếu đến model 'ParkingSlot'
    },

    // === 🚀 THÊM MỚI: BIỂN SỐ XE ===
    // Đây là trường còn thiếu khiến Admin thấy "N/A"
    licensePlate: {
      type: String,
      required: [true, "Biển số xe là bắt buộc"],
      trim: true,
      uppercase: true, // Tự động chuyển thành chữ hoa
    },
    // ===================================

    // Thời gian bắt đầu gửi
    checkInTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Thời gian lấy xe (ban đầu là null)
    checkOutTime: {
      type: Date,
    },
    // === 🚀 THÊM MỚI: LƯU TỔNG TIỀN ===
    totalAmount: {
      type: Number,
      default: 0,
    },
    // Trạng thái của phiên gửi xe
    status: {
      type: String,
      // THÊM GIÁ TRỊ MỚI "IN_PARK" VÀO ENUM
      enum: ["IN_PARK", "completed", "cancelled", "CHECKED_OUT"],
      default: "IN_PARK", // Đặt mặc định là IN_PARK
    },
  },
  {
    timestamps: true,
  }
);

const VehicleLog = mongoose.model("VehicleLog", vehicleLogSchema);

export default VehicleLog;
