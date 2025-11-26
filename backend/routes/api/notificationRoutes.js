// backend/routes/api/notificationRoutes.js

import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "../../controllers/notificationController.js";
// Giả định middleware xác thực là 'protect' trong authMiddleware.js
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Sử dụng middleware protect cho tất cả các route trong router này
router.use(protect);

// GET /api/notifications - Lấy danh sách lịch sử/thông báo
router.get("/", getUserNotifications);

// PUT /api/notifications/:id/read - Đánh dấu đã đọc
router.put("/:id/read", markNotificationAsRead);

export default router;
