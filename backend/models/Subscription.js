// models/Subscription.js
import mongoose, { Schema } from "mongoose"; // Đảm bảo import Schema

const pricingSchema = new Schema( // Dùng Schema trực tiếp
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    // Tên khách hàng
    customerName: {
      type: String,
      required: [true, "Tên khách hàng là bắt buộc"],
      trim: true,
    },
    // Số điện thoại (tùy chọn)
    phoneNumber: {
      type: String,
      trim: true,
    },
    // Biển số xe đăng ký (Phải là duy nhất cho các vé 'Active')
    licensePlate: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
    // Loại xe
    vehicleType: {
      type: String,
      enum: ["Car", "Motorbike"],
      default: null,
    },
    // Tham chiếu đến Gói giá vé tháng (lấy từ Pricing model)
    pricing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pricing",
      required: [true, "Gói giá vé tháng là bắt buộc"],
    },
    // Ngày bắt đầu hiệu lực
    startDate: {
      type: Date,
      required: true,
    },
    // Ngày kết thúc
    endDate: {
      type: Date,
      required: true,
    },
    // Trạng thái của vé
    status: {
      type: String,
      enum: ["Active", "Expired", "Cancelled", "Pending"],
      default: "Pending",
    },
    // Ghi chú
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Đảm bảo 1 biển số xe chỉ có 1 vé tháng 'Active' tại 1 thời điểm
// (Chúng ta sẽ xử lý logic này ở tầng Controller/Service thay vì unique index
// vì một biển số có thể có nhiều vé 'Expired')

const Subscription = mongoose.model("Subscription", pricingSchema);
export default Subscription;
