// backend/middleware/authMiddleware.js

import jwt from "jsonwebtoken";
// Cần đảm bảo file model User sử dụng ES Module export default
import User from "../models/User.js";

/**
 * @desc Middleware xác thực người dùng (Auth)
 * Kiểm tra xem token JWT có hợp lệ không và thêm thông tin người dùng vào req.user
 */
export const protect = async (req, res, next) => {
  let token; // 1. Kiểm tra header Authorization

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Lấy token từ header (format: "Bearer <token>")
      token = req.headers.authorization.split(" ")[1]; // 2. Xác thực token (verify)

      const decoded = jwt.verify(token, process.env.JWT_SECRET); // 3. Tìm người dùng dựa trên ID trong token và loại trừ mật khẩu

      req.user = await User.findById(decoded.id).select("-password").lean();

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Không tìm thấy người dùng cho token này" });
      }

      next(); // Tiếp tục sang bước xử lý tiếp theo (Controller)
    } catch (error) {
      console.error("❌ LỖI XÁC MINH TOKEN:", error.message);
      res.clearCookie("token");
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc hết hạn" });
    }
  } // 4. Xử lý nếu không có token (sau khi kiểm tra header)

  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token, không được phép truy cập" });
  }
};

/**
 * @desc Middleware kiểm tra vai trò (Role) của người dùng
 * @param {string[]} roles - Mảng các vai trò được phép truy cập (Ví dụ: ['Admin', 'Staff'])
 */
export const authorize = (roles = []) => {
  // Đảm bảo roles là mảng
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    // Kiểm tra xem user có tồn tại và vai trò của user có nằm trong mảng các vai trò được phép không
    const userRole = req.user?.role?.toLowerCase();
    const allowedRoles = roles.map((r) => r.toLowerCase());

    if (!req.user || !userRole || !allowedRoles.includes(userRole)) {
      // Nếu vai trò không được phép
      return res.status(403).json({
        message: `Quyền truy cập bị từ chối. Chỉ có: ${roles.join(
          ", "
        )} mới được phép.`,
      });
    }
    next(); // Tiếp tục
  };
};

// Export tất cả middleware bằng ES Module
// Thêm checkOwner vào export nếu cần sau này
