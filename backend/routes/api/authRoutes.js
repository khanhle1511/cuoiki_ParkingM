/**
 * File định tuyến (routes) cho các chức năng liên quan đến Xác thực (Auth).
 * Đã loại bỏ các route ADMIN (User Management).
 */

import express from "express";
const router = express.Router();

import {
  registerUser,
  loginUser,
  getUserProfile,
  updatePassword,
  verifyEmail,
  verifyCode,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  getUserFullProfile,
  updateUserProfileInfo,
  changePassword,
} from "../../controllers/authController.js";
import User from "../../models/User.js";
import { protect } from "../../middleware/authMiddleware.js";

// --- 1. Route Xác thực (PUBLIC) ---

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-code", verifyCode);
router.get("/verify/:token", verifyEmail); // Vẫn giữ link cũ
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

// --- 2. Route Quản lý Hồ sơ (PRIVATE/USER) ---

router.get("/profile", protect, getUserProfile);
router.put("/password", protect, updatePassword);

// *** Các route Admin đã được chuyển sang /api/admin/userManagementRoutes.js ***
// 👇 THÊM CÁC ROUTE MỚI CHO PROFILE VÀO ĐÂY 👇
router.get("/profile/full", protect, getUserFullProfile);
router.put("/profile/update-info", protect, updateUserProfileInfo);
router.put("/profile/change-password", protect, changePassword);
router.get("/fix-db-index", async (req, res) => {
  try {
    // Lệnh xóa index 'name_1' trong MongoDB
    await User.collection.dropIndex("name_1");
    res.send(
      "✅ Đã xóa ràng buộc duy nhất cho Tên hiển thị thành công! Hãy thử cập nhật lại."
    );
  } catch (error) {
    res.send("⚠️ Lỗi hoặc Index đã bị xóa từ trước: " + error.message);
  }
});
export default router;
