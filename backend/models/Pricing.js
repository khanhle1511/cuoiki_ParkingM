// models/Pricing.js
import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema(
  {
    // Tên gói giá (Chỉ dùng để hiển thị, KHÔNG UNIQUE)
    name: {
      type: String,
      required: [true, "Tên gói là bắt buộc"], // 🔥 Bắt buộc điền tên
      trim: true,
      default: undefined,
    },
    vehicleType: {
      type: String,
      enum: ["Car", "Motorbike", "Bicycle"],
      default: "Car",
    },
    rateType: {
      // 🔥 ĐÃ CẬP NHẬT: Thêm "Daily"
      type: String,
      enum: ["Hourly", "Daily", "HalfMonthly", "Monthly", "Yearly"],
      default: "Hourly",
    },
    rate: {
      type: Number,
      required: [true, "Giá tiền là bắt buộc"],
      min: [0, "Giá tiền không thể âm"],
    },
    durationValue: {
      type: Number,
      default: 1,
      min: [1, "Giá trị thời hạn phải lớn hơn 0"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // 🔥 TRƯỜNG MỚI 1: URL ảnh hiển thị trên card
    cardImageUrl: {
      type: String,
      trim: true,
      default: "/images/default-card.jpg", // Có thể đặt default
    },
    // 🔥 TRƯỜNG MỚI 2: URL ảnh hiển thị chi tiết gói/voucher
    detailImageUrl: {
      type: String,
      trim: true,
      default: "/images/default-detail.jpg",
    },
    // 🔥 TRƯỜNG MỚI 3: Mô tả chi tiết (dùng cho phần chi tiết gói/voucher)
    detailDescription: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    setDefaultsOnInsert: true,
  }
);

pricingSchema.index({ vehicleType: 1, rateType: 1 }, { unique: false });

const Pricing = mongoose.model("Pricing", pricingSchema);
export default Pricing;
