import jwt from "jsonwebtoken";

/**
 * Tạo JSON Web Token (JWT)
 * @param {string} id - User ID (dùng để lưu trong token)
 * @returns {string} - Chuỗi JWT đã tạo
 */
const generateToken = (id) => {
  // Ký (sign) token với User ID, khóa bí mật (JWT_SECRET), và thời gian hết hạn (expiresIn)
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Hết hạn sau 30 ngày
  });
};

export default generateToken;
