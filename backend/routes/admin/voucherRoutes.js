import express from "express";
import {
  getAvailableVouchers,
  getVouchers,
  createVoucher,
  deleteVoucher,
  updateVoucher,
  toggleActiveStatus,
  grantVoucherToUser,
  getMyVouchers, // <-- IMPORT HÀM MỚI
} from "../../controllers/voucherController.js"; // <-- Lùi 2 cấp ../../
import {
  getAllVouchersAdmin,
  getVoucherOwners,
} from "../../controllers/voucherController.js";
import { protect, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Tất cả route dưới đây đều cần quyền Admin
router.use(protect, authorize(["Admin", "Manager"]));

// GET /api/admin/vouchers và POST /api/admin/vouchers
router.route("/").get(getVouchers).post(createVoucher);

// PUT /api/admin/vouchers/:id và DELETE /api/admin/vouchers/:id
router.route("/:id").put(updateVoucher).delete(deleteVoucher);

// PATCH /api/admin/vouchers/:id/toggle
router.patch("/:id/toggle", toggleActiveStatus);

router.post("/grant", grantVoucherToUser);
// 🔥 Route lấy voucher của tôi
// URL đầy đủ: /api/vouchers/mine (nếu index.js dùng app.use('/api/vouchers', ...))
// LƯU Ý: Nếu frontend gọi /api/user/vouchers/mine thì bạn phải chỉnh lại frontend hoặc backend cho khớp.
router.get("/mine", protect, getMyVouchers);
// GET /api/admin/vouchers
router.get("/vouchers", protect, authorize("Admin"), getAllVouchersAdmin);

// GET /api/admin/owners/voucher/:id
router.get(
  "/owners/voucher/:id",
  protect,
  authorize("Admin"),
  getVoucherOwners
);
export default router;
