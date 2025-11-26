import express from "express";
const router = express.Router();

// Lấy các middlewares cần thiết
import { protect, authorize } from "../middleware/authMiddleware.js";

// Import các route đã phân loại
// --- Public/Auth Routes ---
import authRoutes from "./api/authRoutes.js";
import pricingRoutes from "./public/pricingRoutes.js";

// --- Admin Routes ---
import parkingSlotRoutes from "./admin/parkingSlotRoutes.js";
import userManagementRoutes from "./admin/userManagementRoutes.js";
import adminPricingRoutes from "./admin/pricingRoutes.js";

// --- User Routes ---
import vehicleLogRoutes from "./user/vehicleLogRoutes.js";

import userRoutes from "./user/userRoutes.js";
// 🔥 QUAN TRỌNG: Đã thêm getMetrics vào đây để sửa lỗi ReferenceError
import {
  getParkingMap,
  getAvailableSlotsByType,
  getMetrics,
  getAllVehicleLogs
} from "../controllers/parkingSlotController.js";
import voucherRoutes from "./admin/voucherRoutes.js";
import {
  getAvailableVouchers,
  getMyVouchers,
} from "../controllers/voucherController.js";
import subscriptionRoutes from "./api/subscriptionRoutes.js"; // <-- THÊM DÒNG NÀY
import notificationRoutes from "./api/notificationRoutes.js";
import { getItemOwners } from "../controllers/authController.js";
const adminRoles = ["Admin", "Manager"];
const allRoles = ["User", "Admin", "Manager"];

// =================================================================
// 1. PUBLIC ROUTES (Không cần đăng nhập)
// =================================================================

// /api/auth
router.use("/auth", authRoutes);

router.use("/users", userRoutes);
// /api/pricing (Public view)
router.use("/pricing", pricingRoutes);

// =================================================================
// 2. PROTECTED USER/COMMON ROUTES (Yêu cầu đăng nhập)
// =================================================================
router.use("/", protect, authorize(allRoles), userRoutes);
// /api/vehicle (Quản lý log xe, Check-in/Check-out)
router.use("/vehicle", protect, authorize(allRoles), vehicleLogRoutes);
router.use("/subscriptions", protect, authorize(allRoles), subscriptionRoutes);

// ⭐ THAY ĐỔI MỚI: Tích hợp Notification Routes
// API endpoint sẽ là /api/notifications
router.use("/notifications", protect, authorize(allRoles), notificationRoutes);
// /api/parking/map (User/Admin xem sơ đồ)
router.get("/parking/map", protect, authorize(allRoles), getParkingMap);
// /api/user/vouchers/mine (Lấy danh sách Voucher người dùng đã sở hữu)
router.get(
  "/user/vouchers/mine", // <-- Đúng với endpoint Frontend đang gọi
  protect,
  authorize(allRoles),
  getMyVouchers
);
// /api/parking/available/:type (Xem chỗ trống theo loại xe)
router.get(
  "/parking/available/:type",
  protect,
  authorize(allRoles),
  getAvailableSlotsByType
);

// 🔥 /api/parking/metrics (Lấy thống kê - Cho cả User và Admin)
router.get("/parking/metrics", protect, authorize(allRoles), getMetrics);

// =================================================================
// 3. ADMIN ROUTES (Yêu cầu Admin Role)
// =================================================================
router.get(
  "/admin/logs/all",
  protect,
  authorize(adminRoles),
  getAllVehicleLogs
);
// /api/admin/pricing (Quản lý Giá & Gói - PUT/POST)
router.use(
  "/admin/pricing",
  protect,
  authorize(adminRoles),
  adminPricingRoutes
);

// /api/admin/parking (Quản lý thêm/sửa/xóa chỗ đỗ)
router.use("/admin/parking", protect, authorize(adminRoles), parkingSlotRoutes);

// /api/admin/users (Quản lý người dùng)
router.use(
  "/admin/users",
  protect,
  authorize(adminRoles),
  userManagementRoutes
);
router.use("/admin/vouchers", protect, authorize(adminRoles), voucherRoutes);
router.use("/logs", vehicleLogRoutes);
router.get(
  "/admin/owners/:type/:id",
  protect,
  authorize(adminRoles),
  getItemOwners
);
export default router;
