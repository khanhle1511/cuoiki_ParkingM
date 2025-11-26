import express from "express";
// 🎯 Import Controller và Middleware bằng cú pháp ES Module
import * as pricingController from "../../controllers/pricingController.js";
import * as authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// =================================================================
// 💰 PUBLIC ROUTES
// =================================================================

// GET /api/pricing (Lấy giá công khai cho User Dashboard)
router.route("/").get(pricingController.getPricing);

// =================================================================
// ⚙️ ADMIN ROUTES (Yêu cầu xác thực và quyền Admin)
// =================================================================

// Admin Route: GET & POST /api/pricing/admin
router
  .route("/admin")
  // GET /api/pricing/admin (Lấy tất cả gói giá, kể cả inactive)
  .get(
    authMiddleware.protect,
    authMiddleware.authorize(["Admin"]),
    pricingController.getAdminPricing
  )
  // POST /api/pricing/admin (Tạo gói giá mới)
  .post(
    authMiddleware.protect,
    authMiddleware.authorize(["Admin"]),
    pricingController.createPricing
  );

// Admin Route: PUT /api/pricing/:id
router
  .route("/:id")
  // PUT /api/pricing/:id (Cập nhật gói giá theo ID)
  .put(
    authMiddleware.protect,
    authMiddleware.authorize(["Admin"]),
    pricingController.updatePricingById
  );
// 🔥 THÊM ROUTE MỚI: GET /api/pricing/subscriptions
router.get("/subscriptions", pricingController.getSubscriptions);
// 🎯 SỬA LỖI: Export bằng ES Module (Export default)
export default router;
