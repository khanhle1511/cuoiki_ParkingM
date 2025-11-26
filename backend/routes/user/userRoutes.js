import express from "express";
import { protect } from "../../middleware/authMiddleware.js";

// Import các hàm xử lý từ Controller
import {
  getUserFullProfile,
  updateUserProfileInfo,
  changePassword,
} from "../../controllers/authController.js";

// Import hàm xử lý Voucher
import {
  getAvailableVouchers,
  getMyVouchers,
} from "../../controllers/voucherController.js";

const router = express.Router();

// --- CÁC ROUTE MỚI CHO DASHBOARD ---

// 1. Lấy hồ sơ đầy đủ (Dashboard gọi cái này)
router.get("/profile/full", protect, getUserFullProfile);

// 2. Cập nhật thông tin
router.put("/profile/update-info", protect, updateUserProfileInfo);

// 3. Đổi mật khẩu
router.put("/profile/change-password", protect, changePassword);

// 4. Voucher
router.get("/vouchers/available", protect, getAvailableVouchers);
router.get("/vouchers/mine", protect, getMyVouchers);

export default router;
