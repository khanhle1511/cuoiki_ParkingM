// backend/middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";

// Cấu hình nơi lưu trữ (Storage)
const storage = multer.diskStorage({
  // Thư mục đích: public/images/pricing
  destination: (req, file, cb) => {
    cb(null, "public/images/pricing");
  },
  // 🔥 SỬA ĐỔI QUAN TRỌNG TẠI ĐÂY:
  // Không dùng req.body.name nữa vì nó không ổn định lúc upload.
  // Dùng Timestamp + Random để tạo tên file duy nhất.
  filename: (req, file, cb) => {
    // Tạo đuôi ngẫu nhiên để tránh trùng lặp tuyệt đối
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // Lấy đuôi file gốc (ví dụ: .jpg, .png)
    const ext = path.extname(file.originalname);

    // Tên file: pricing-17321456789-123456.jpg
    cb(null, `pricing-${uniqueSuffix}${ext}`);
  },
});

// Cấu hình Filter (Chỉ chấp nhận file ảnh)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
}).fields([
  { name: "cardImage", maxCount: 1 },
  { name: "detailImage", maxCount: 1 },
]);

export default upload;
