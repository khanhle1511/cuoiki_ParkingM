import mongoose from "mongoose";

const parkingSlotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên (name) của chỗ đỗ là bắt buộc"],
      unique: true, // 🚀 QUAN TRỌNG: Tên tự động tạo là duy nhất
      trim: true,
    },
    vehicleType: {
      type: String,
      required: [true, "Loại xe là bắt buộc"],
      enum: ["motorbike", "car", "bicycle"], // 🚀 Vẫn là 3 loại xe
    },
    // === 🚀 THÊM MỚI: Thêm trường "Khu vực" (Area) ===
    area: {
      type: String,
      required: [true, "Khu vực là bắt buộc"],
      // 🚀 Admin sẽ chọn 1 trong 4 khu này
      enum: ["motorbike", "bicycle", "car-1", "car-2"],
    },
    // ==========================================
    status: {
      type: String,
      enum: ["available", "booked", "occupied", "maintenance"],
      default: "available",
    },
    currentLog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleLog",
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const ParkingSlot = mongoose.model("ParkingSlot", parkingSlotSchema);
export default ParkingSlot;
