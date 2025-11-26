import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Mã voucher là bắt buộc"],
      unique: true,
      uppercase: true, // Tự động viết hoa (VD: SALE50)
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FIXED"], // Mở rộng: Theo % hoặc Trừ tiền cứng
      default: "PERCENTAGE",
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
      // Nếu là PERCENTAGE thì max là 100
    },
    maxDiscountAmount: {
      type: Number,
      default: 0, // 0 nghĩa là không giới hạn số tiền giảm tối đa
    },
    minBillAmount: {
      type: Number,
      default: 0, // Áp dụng cho mọi đơn hàng
    },
    usageLimit: {
      type: Number,
      default: 100, // Số lượng voucher phát hành
    },
    usedCount: {
      type: Number,
      default: 0, // Số lần đã dùng
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    triggerType: {
      type: String,
      enum: ["NONE", "SPENDING_MILESTONE", "PARKING_COUNT_MILESTONE"],
      default: "NONE", // Mặc định là không tự động (chỉ tặng tay hoặc user tự lấy)
    },
    // Giá trị điều kiện.
    // VD: Nếu triggerType="SPENDING_MILESTONE", triggerValue=1000000 (Đạt 1 triệu được tặng)
    // VD: Nếu triggerType="PARKING_COUNT_MILESTONE", triggerValue=10 (Đỗ 10 lần được tặng)
    triggerValue: {
      type: Number,
      default: 0,
    },
    maxUsagePerUser: {
      type: Number,
      default: 1, // Mặc định mỗi người chỉ được 1 cái
    },
  },
  { timestamps: true }
);

const Voucher = mongoose.model("Voucher", voucherSchema);
export default Voucher;
