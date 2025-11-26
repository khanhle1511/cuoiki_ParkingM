// backend/models/Notification.js

import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  // ID của người dùng nhận thông báo
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Tham chiếu đến Model User
    required: true,
  },
  // Tiêu đề/Tóm tắt của thông báo
  title: {
    type: String,
    required: true,
  },
  // Nội dung chi tiết hoặc mô tả
  message: {
    type: String,
    required: true,
  },
  // Loại sự kiện (giúp frontend biết cách hiển thị icon hoặc màu sắc)
  // Ví dụ: 'SUBSCRIPTION', 'VOUCHER', 'CHECKOUT'
  type: {
    type: String,
    enum: [
      "SYSTEM",
      "SUBSCRIPTION",
      "VOUCHER",
      "CHECKOUT",
      "PARKING",
      "PROMOTION",
      "PAYMENT",
    ],
    default: "SYSTEM",
  },
  // Dữ liệu bổ sung (có thể là JSON hoặc object)
  // Ví dụ: chi tiết giao dịch, ID voucher, thông tin log xe
  data: {
    type: mongoose.Schema.Types.Mixed, // Cho phép lưu trữ bất kỳ loại dữ liệu nào (Object, Array,...)
    default: {},
  },
  // Trạng thái đã đọc
  isRead: {
    type: Boolean,
    default: false,
  },
  // Thời điểm thông báo được tạo
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Notification", NotificationSchema);
