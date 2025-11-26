import express from "express";
const router = express.Router();

// Import các hàm xử lý Admin từ authController (đã được đổi tên thành userController nếu có)
// Tạm thời vẫn import từ authController để giữ nguyên logic
import {
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
} from "../../controllers/authController.js"; // Giả định path này

// Import middleware
import { protect, authorize } from "../../middleware/authMiddleware.js";

// Tất cả route ở đây đều yêu cầu Admin Role
const adminRoles = ["Admin", "Manager"];

// GET /api/auth/all-users
router.route("/all-users").get(protect, authorize(adminRoles), getAllUsers);

// GET /api/auth/user/:id (Lấy chi tiết 1 user)
// PATCH /api/auth/user/:id (Cập nhật thông tin người dùng bởi Admin)
// DELETE /api/auth/user/:id (Xóa người dùng bởi Admin)
router
  .route("/user/:id")
  .get(protect, authorize(adminRoles), getUserById)
  .patch(protect, authorize(adminRoles), updateUserByAdmin)
  .delete(protect, authorize(["Admin"]), deleteUser); // Chỉ Admin được xóa

export default router;
