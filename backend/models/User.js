import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng thêm tên"],
    },
    email: {
      type: String,
      required: [true, "Vui lòng thêm email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Vui lòng nhập một địa chỉ email hợp lệ",
      ],
    },
    username: {
      type: String,
      required: [true, "Vui lòng thêm tên người dùng"],
      unique: true,
    },
    mobile: {
      type: String,
      default: null,
      // unique: true, // Tạm thời không set unique để tránh lỗi với chuỗi rỗng
    },
    password: {
      type: String,
      required: [true, "Vui lòng thêm mật khẩu"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"], // Đã sửa lỗi: Giảm xuống 6 ký tự cho phép đăng ký
      select: false, // Không trả về mật khẩu khi tìm kiếm user
    },
    role: {
      type: String,
      enum: ["User", "Admin", "Manager"],
      default: "User",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verificationToken: String, // Lưu mã OTP 6 chữ số
    verificationTokenExpires: Date, // Thời điểm mã OTP hết hạn (ví dụ: sau 1 giờ)
    notes: {
      type: String,
      default: "",
    },
    totalSpending: {
      type: Number,
      default: 0,
    },
    // Tổng số lượt gửi xe thành công (đã checkout)
    parkingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Middleware Mongoose (chạy trước khi lưu document)
userSchema.pre("save", async function (next) {
  // Chỉ hash mật khẩu nếu nó được chỉnh sửa
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Nếu là người dùng mới và chưa được xác thực, tạo mã OTP
  if (this.isNew && !this.isVerified) {
    // Tạo mã OTP 6 chữ số ngẫu nhiên
    const min = 100000; // 6 digits min
    const max = 999999; // 6 digits max
    const otp = String(Math.floor(Math.random() * (max - min + 1)) + min);

    // Lưu mã OTP và thời gian hết hạn (ví dụ: 1 giờ sau)
    this.verificationToken = otp;
    this.verificationTokenExpires = Date.now() + 60 * 60 * 1000; // 1 giờ
  }

  next();
});

// Phương thức để kiểm tra mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Vì password có select: false, ta phải thêm 'select('+password+')' khi lấy user
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
