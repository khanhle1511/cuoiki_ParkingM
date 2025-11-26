import express from "express";
const router = express.Router();

import { protect, authorize } from "../../middleware/authMiddleware.js";
import { getAvailableVouchers } from "../../controllers/voucherController.js";
// Giả định bạn có hàm để lấy voucher của riêng user
import { getMyVouchers } from "../../controllers/voucherController.js";
import {
  // 👇 Đảm bảo đã import 3 hàm này
  getUserFullProfile,
  updateUserProfileInfo,
  changePassword,
} from "../../controllers/authController.js";
const allRoles = ["User", "Admin", "Manager"];

// 1. GET /vouchers/available (Voucher Khả dụng cho tất cả user đã đăng nhập)
router.get(
  "/vouchers/available",
  protect,
  authorize(allRoles),
  getAvailableVouchers
);

// 2. GET /user/vouchers/mine (Voucher cá nhân đã sở hữu)
// Route này sẽ khắc phục lỗi 404 thứ hai nếu bạn định nghĩa nó đúng.
// Giả định API_MINE là /api/user/vouchers/mine
router.get(
  "/user/vouchers/mine",
  protect,
  authorize(allRoles),
  getMyVouchers // Cần tạo hàm này trong controller
);
router.get("/profile/full", protect, getUserFullProfile);
router.put("/profile/update-info", protect, updateUserProfileInfo);
router.put("/profile/change-password", protect, changePassword);

// 4. Lấy voucher của tôi
// GET /api/users/vouchers/mine
// (Tạm thời dùng chung logic với profile/full hoặc trỏ tới controller riêng nếu có)
router.get("/vouchers/mine", protect, (req, res) => {
  // Nếu bạn chưa viết controller riêng, có thể redirect hoặc trả về data mẫu
  // Tốt nhất là nên gọi: getMyVouchers(req, res);
  res
    .status(200)
    .json({ message: "API lấy voucher cá nhân (Cần implement controller)" });
});

// 5. Lấy gói ưu đãi khả dụng (cho tất cả user xem để mua)
// GET /api/users/vouchers/available
router.get("/vouchers/available", protect, (req, res) => {
  // Tương tự: getAvailableVouchers(req, res);
  res
    .status(200)
    .json({ message: "API lấy voucher hệ thống (Cần implement controller)" });
});
export default router;
