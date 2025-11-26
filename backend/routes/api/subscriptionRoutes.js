import express from "express";
const router = express.Router();

import { protect, authorize } from "../../middleware/authMiddleware.js";
import {
  purchaseSubscription,
  getMyActiveSubscriptions,
} from "../../controllers/subscriptionController.js"; // Import hàm mới

const allRoles = ["User", "Admin", "Manager"];

// POST /api/subscriptions/purchase
router.post("/purchase", protect, authorize(allRoles), purchaseSubscription);
router.get(
  "/mine",
  protect,
  authorize(allRoles),
  getMyActiveSubscriptions // <--- THÊM ROUTE NÀY
);
router.get("/", protect, authorize(allRoles), getMyActiveSubscriptions);
export default router;
