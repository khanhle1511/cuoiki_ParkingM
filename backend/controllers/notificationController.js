// backend/controllers/notificationController.js

import Notification from "../models/Notification.js";

// =================================================================
// @desc    Lấy danh sách thông báo/lịch sử của User
// @route   GET /api/notifications
// @access  Protected (User)
// =================================================================
export const getUserNotifications = async (req, res) => {
  try {
    // Lấy ID người dùng từ token (đã được middleware protect thêm vào req.user)
    const userId = req.user._id;

    // 1. Tìm tất cả thông báo thuộc về người dùng
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian mới nhất lên đầu
      .limit(50); // Giới hạn số lượng (ví dụ: 50 bản ghi gần nhất)

    res.json(notifications);
  } catch (error) {
    console.error("Lỗi khi lấy thông báo:", error);
    res.status(500).json({ message: "Lỗi Server khi tải thông báo." });
  }
};

// =================================================================
// @desc    Đánh dấu thông báo là đã đọc
// @route   PUT /api/notifications/:id/read
// @access  Protected (User)
// =================================================================
export const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;

    // Chỉ cập nhật thông báo của chính user đó và chưa đọc
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: userId, isRead: false },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      // Có thể là đã đọc rồi, hoặc không tìm thấy, hoặc không phải của user
      return res.status(200).json({
        message: "Thông báo đã được đánh dấu là đã đọc (hoặc không tìm thấy).",
      });
    }

    res.json({ message: "Đã đánh dấu là đã đọc.", notification });
  } catch (error) {
    console.error("Lỗi khi đánh dấu đã đọc:", error);
    res.status(500).json({ message: "Lỗi Server." });
  }
};
