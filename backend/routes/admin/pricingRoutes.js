import express from "express";
// 🎯 Import Controller
import * as pricingController from "../../controllers/pricingController.js";
// 🎯 Import Middleware Upload
import upload from "../../middleware/uploadMiddleware.js";
import {
  getAllPricingAdmin,
  getPricingOwners,
} from "../../controllers/pricingController.js";
import { getPublicPricing } from "../../controllers/pricingController.js";
import { protect, authorize } from "../../middleware/authMiddleware.js";
const router = express.Router();

// =================================================================
// 1. CÁC ROUTE CẬP NHẬT GIÁ THEO GIỜ (HOURLY RATES)
// =================================================================
// PUT /api/admin/pricing/hourly
router.put("/hourly", pricingController.updateHourlyRates);

// PUT /api/admin/pricing/hourly/single
router.put("/hourly/single", pricingController.updateHourlyRateByVehicleType);

// =================================================================
// 2. ROUTE QUẢN LÝ GÓI DỊCH VỤ (SUBSCRIPTIONS) - TẠO MỚI & LẤY DS
// =================================================================
// Frontend gọi: /api/admin/pricing/admin
router
  .route("/admin")
  // GET: Lấy danh sách tất cả gói (cho admin)
  .get(pricingController.getAdminPricing)
  // POST: Tạo gói mới (CÓ UPLOAD ẢNH)
  .post(upload, pricingController.createPricing);

// =================================================================
// 3. ROUTE CẬP NHẬT & XÓA GÓI DỊCH VỤ THEO ID
// =================================================================
// Frontend gọi: /api/admin/pricing/:id
router
  .route("/:id")
  // PUT: Cập nhật gói (CÓ UPLOAD ẢNH) -> Dùng hàm updateSubscription
  .put(upload, pricingController.updateSubscription)

  // DELETE: Xóa gói (Bạn có thể dùng updatePricingById nếu muốn soft-delete hoặc hàm delete riêng)
  // Ở đây tôi tạm dùng hàm delete (nếu bạn chưa có hàm deleteSubscription, hãy dùng updatePricingById để set isActive: false)
  .delete(async (req, res) => {
    try {
      // Import model trực tiếp hoặc dùng controller nếu có hàm delete
      const Pricing = (await import("../../models/Pricing.js")).default;
      await Pricing.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Đã xóa gói thành công." });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa gói." });
    }
  });
// GET /api/pricing -> Trả về bảng giá
router.get("/", getPublicPricing);
// GET /api/admin/pricing
router.get("/pricing", protect, authorize("Admin"), getAllPricingAdmin);

// GET /api/admin/owners/plan/:id
router.get("/owners/plan/:id", protect, authorize("Admin"), getPricingOwners);
export default router;
