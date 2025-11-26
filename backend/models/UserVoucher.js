import mongoose from "mongoose";

const userVoucherSchema = new mongoose.Schema(
  {
    // Liên kết đến người dùng sở hữu voucher
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    // Liên kết đến Voucher gốc (do Admin tạo)
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Voucher",
    },
    // Trạng thái: usable (có thể dùng), used (đã dùng), expired (hết hạn)
    status: {
      type: String,
      enum: ["usable", "used", "expired"],
      default: "usable",
    },
    // Số lần sử dụng còn lại (nếu voucher cho phép dùng nhiều lần)
    usageCount: {
      type: Number,
      default: 1, // Mặc định mỗi voucher cá nhân chỉ dùng 1 lần
    },
    source: {
      type: String,
      enum: ["system_reward", "admin_grant", "claim"],
      default: "system_reward", // Mặc định
    },
  },
  { timestamps: true }
);
userVoucherSchema.index({ user: 1, voucher: 1 }, { unique: true });
const UserVoucher = mongoose.model("UserVoucher", userVoucherSchema);
export default UserVoucher;
