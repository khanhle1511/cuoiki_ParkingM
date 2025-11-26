// Tệp: backend/routes/api/vehicleLogRoutes.js

import express from "express";
import {
  checkIn,
  checkoutParkingFee,
  getActiveLog,
} from "../../controllers/vehicleLogController.js";
import { protect, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Tất cả roles (User, Admin, Manager) có thể sử dụng các chức năng này
const allRoles = ["User", "Admin", "Manager"];

// 1. POST /api/logs/check-in
router.post("/check-in", protect, authorize(allRoles), checkIn);

// 2. GET /api/logs/active
router.get("/active", protect, authorize(allRoles), getActiveLog);

// 3. POST /api/logs/checkout/:logId
// (Chỉ cần route này để thanh toán và cập nhật trạng thái)
router.post(
  "/checkout/:logId",
  protect,
  authorize(allRoles),
  checkoutParkingFee
);

// BỎ DÒNG SAU (ĐÃ GÂY LỖI XUNG ĐỘT HOẶC undefined logId):
// router.post("/checkout", protect, checkoutParkingFee);

export default router;
