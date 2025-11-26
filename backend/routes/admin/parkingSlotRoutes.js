import express from "express";
const router = express.Router();
// Đã chuyển sang ES Module import
import * as parkingController from "../../controllers/parkingSlotController.js";
import { protect, authorize } from "../../middleware/authMiddleware.js";

// --- Các route này sẽ được gắn chung middleware authorize(['Admin', 'Manager']) ở routes/index.js ---
// Admin: GET /api/admin/parking/metrics (Lấy số liệu thống kê)
// SỬA LỖI: Dùng parkingController.getMetrics
router.get("/metrics", parkingController.getMetrics);
// Admin: GET /api/parking/all
router.get("/all", parkingController.getAllSlots);

// Admin: POST /api/parking (Tạo slot mới)
router.post("/", parkingController.createSlot);

// Admin: PUT /api/parking/:id (Sửa slot)
router.put("/:id", parkingController.updateSlot);

// Admin: DELETE /api/parking/:id (Xóa slot)
router.delete("/:id", parkingController.deleteSlot);

// Admin: PUT /api/parking/:id/status (Khóa/Mở)
router.put("/:id/status", parkingController.toggleSlotStatus);

// === Route User (Đã tách ra) ===
// GET /api/parking/map & /available/:type sẽ được chuyển sang User Routes

export default router;
