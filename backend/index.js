// backend/index.js

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import Model User (Đã chuyển sang ES Module)
import User from "./models/User.js";

// Import file tổng hợp Routes (Đã chuyển sang ES Module)
import apiRoutes from "./routes/index.js";

// ⭐ THAY ĐỔI MỚI: Import Notification Service
import { initNotificationService } from "./services/notificationService.js";
import userRoutes from "./routes/user/userRoutes.js"; 
// Tải biến môi trường
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Khởi tạo Express App
const app = express();

// ------------------------------------------
// 🚀 MIDDLEWARE (Cấu hình)
// ------------------------------------------
app.use(express.json()); // Cho phép parse JSON body
app.use(
  cors({
    // Sử dụng biến môi trường cho tính linh hoạt
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// 🔥 CẤU HÌNH QUAN TRỌNG CHO FILE UPLOAD (MULTER)
// Cho phép truy cập các file tĩnh trong thư mục 'public'.
// Ví dụ: ảnh được lưu tại backend/public/images/pricing/card.jpg sẽ được truy cập qua /images/pricing/card.jpg
app.use(express.static(path.join(__dirname, "public")));

// ------------------------------------------
// 1. Kết nối MongoDB (Đã chuyển sang ES Module)
// ------------------------------------------
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB đã kết nối thành công: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ LỖI KẾT NỐI DB: ${error.message}`);
    process.exit(1);
  }
};

// ----- HÀM SEED ADMIN (Đã chuyển sang ES Module) -----
const seedAdmin = async () => {
  try {
    // 1. Kiểm tra xem có Admin nào tồn tại chưa
    const adminExists = await User.findOne({ username: "admin" });

    if (adminExists) {
      if (adminExists.role !== "Admin") {
        adminExists.role = "Admin";
        await adminExists.save();
        console.log("ℹ️ Đã cập nhật vai trò cho tài khoản Admin.");
      } else {
        console.log("ℹ️ Tài khoản Admin đã tồn tại.");
      }
      return;
    } // 2. Nếu chưa có, tạo Admin mới
    await User.create({
      name: "Administrator",
      email: "admin@system.com",
      username: "admin",
      password: "12345678910",
      role: "Admin",
      isActive: true,
      isVerified: true,
    });
    console.log("✅ ĐÃ TẠO TÀI KHOẢN ADMIN MẶC ĐỊNH (admin / 12345678910)");
  } catch (error) {
    console.error(`❌ LỖI KHI SEED ADMIN: ${error.message}`);
  }
};

// ------------------------------------------
// API Routes (Sử dụng file tổng hợp routes/index.js)
// ------------------------------------------
// 🔥 Route này bao gồm tất cả các route con: auth, users, logs, pricing, vouchers, subscriptions
app.use("/api", apiRoutes);

// Endpoint kiểm tra sức khỏe
app.get("/", (req, res) => {
  res.send("API đang chạy...");
});

// Xử lý lỗi 404 (Không tìm thấy route)
app.use((req, res, next) => {
  res.status(404).json({ message: `Không tìm thấy API: ${req.originalUrl}` });
});

// ------------------------------------------
// ----- HÀM KHỞI ĐỘNG SERVER -----
// ------------------------------------------
const startServer = async () => {
  await connectDB(); // Chờ kết nối DB xong
  await seedAdmin(); // Chờ Seed Admin xong // ⭐ THAY ĐỔI MỚI: Khởi động Service lắng nghe sự kiện
  initNotificationService();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(
      `🚀 Server đang chạy trên cổng ${PORT} (http://localhost:${PORT})`
    );
  });
};

// ----- BẮT ĐẦU CHẠY SERVER -----
startServer(); // Gọi hàm bất đồng bộ để khởi động
