import Notification from "../models/Notification.js";
import appEvents from "../utils/eventEmitter.js";

// --- CÁC LOẠI SỰ KIỆN ---
export const EVENTS = {
  SUBSCRIPTION_PURCHASED: "SUBSCRIPTION_PURCHASED",
  VOUCHER_GRANTED: "VOUCHER_GRANTED",
  PARKING_CHECKOUT: "PARKING_CHECKOUT",
};

// --- HÀM XỬ LÝ & LƯU DB ---
const handleCreateNotification = async (data) => {
  try {
    await Notification.create({
      userId: data.user,
      title: data.title,
      message: data.message,
      type: data.type,
      metadata: data.metadata,
      isRead: false,
    });
    console.log(`🔔 [Notification] Created: ${data.title}`);
  } catch (error) {
    console.error("❌ [Notification] Error creating notification:", error);
  }
};

// --- ĐĂNG KÝ LẮNG NGHE (LISTENERS) ---
export const initNotificationService = () => {
  console.log("🚀 Notification Service Started...");

  // 1. Lắng nghe sự kiện Mua Gói
  appEvents.on(
    EVENTS.SUBSCRIPTION_PURCHASED,
    ({ user, package: pkg, endDate }) => {
      handleCreateNotification({
        user,
        type: "PAYMENT",
        title: "Đăng ký gói thành công!",
        message: `Bạn đã đăng ký gói ${
          pkg.name
        } thành công. Hạn dùng đến ${new Date(endDate).toLocaleDateString(
          "vi-VN"
        )}.`,
        metadata: { subscriptionName: pkg.name },
      });
    }
  );

  // 2. Lắng nghe sự kiện Nhận Voucher
  appEvents.on(EVENTS.VOUCHER_GRANTED, ({ user, voucher, source }) => {
    let title = "🎁 Bạn nhận được quà tặng!";
    let message = `Chúc mừng! Bạn đã nhận được voucher ${voucher.code}.`;

    if (source === "admin_grant") {
      title = "🎁 Quà tặng từ Admin";
      message = `Admin đã gửi tặng bạn voucher ${voucher.code}. Kiểm tra ví ngay!`;
    }

    handleCreateNotification({
      user,
      type: "PROMOTION",
      title,
      message,
      metadata: { voucherCode: voucher.code },
    });
  });

  // 3. Lắng nghe sự kiện Check-out
  appEvents.on(EVENTS.PARKING_CHECKOUT, ({ user, log, fee, timeOut }) => {
    const timeOutStr = new Date(timeOut).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    handleCreateNotification({
      user,
      type: "PARKING",
      title: "🚗 Thanh toán đỗ xe thành công",
      message: `Xe ${
        log.licensePlate
      } đã rời bãi lúc ${timeOutStr}. Tổng: ${fee.toLocaleString()}đ.`,
      metadata: {
        licensePlate: log.licensePlate,
        amount: fee,
        timeIn: log.checkInTime,
        timeOut: timeOut,
      },
    });
  });
};
