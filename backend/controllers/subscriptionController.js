import Subscription from "../models/Subscription.js"; // Import Subscription Model
import Pricing from "../models/Pricing.js"; // Import Pricing Model
import User from "../models/User.js"; // Import User Model
import { addMonths, addDays, addYears } from "date-fns"; // Sử dụng date-fns để tính ngày hết hạn
import appEvents from "../utils/eventEmitter.js";
import { EVENTS } from "../services/notificationService.js";
// Hàm helper để tính ngày kết thúc
const calculateEndDate = (startDate, rateType, durationValue) => {
  switch (rateType) {
    case "Daily":
      return addDays(startDate, durationValue);
    case "HalfMonthly": // Giả định nửa tháng là 15 ngày
      return addDays(startDate, durationValue * 15);
    case "Monthly":
      return addMonths(startDate, durationValue);
    case "Yearly":
      return addYears(startDate, durationValue);
    default:
      return null;
  }
};

// =================================================================
// @desc    Xử lý mua gói đăng ký (Subscription)
// @route   POST /api/subscriptions/purchase
// @access  Protected (User)
// =================================================================
export const purchaseSubscription = async (req, res) => {
  const userId = req.user._id; // Lấy ID người dùng từ token
  const { subscriptionId, discountId } = req.body;

  if (!subscriptionId) {
    return res.status(400).json({ message: "Thiếu thông tin gói đăng ký" });
  }

  try {
    // 1. Kiểm tra gói giá có tồn tại và đang Active không
    const pricingPackage = await Pricing.findById(subscriptionId);

    if (
      !pricingPackage ||
      !pricingPackage.isActive ||
      pricingPackage.rateType === "Hourly"
    ) {
      return res
        .status(404)
        .json({ message: "Gói dịch vụ không hợp lệ hoặc đã hết hạn." });
    }

    // 🔥 2. XỬ LÝ VOUCHER (Nếu Frontend gửi discountId)
    // Nếu bạn muốn áp dụng giảm giá khi mua gói, bạn cần viết logic kiểm tra:
    // Nếu discountId là "none", thì không làm gì cả.
    // Nếu discountId là ID Voucher, tính lại giá cuối cùng (finalPrice) dựa trên giá gốc pricingPackage.rate

    // Hiện tại, ta TẠM THỜI bỏ qua discountId trong luồng MUA GÓI
    // vì đây là luồng Purchase, không phải luồng Check-out.
    let finalPrice = pricingPackage.rate;
    let discountApplied = 0;

    // 🔥 FIX LỖI THIẾU KIỂM TRA BẮT BUỘC:
    // Nếu Frontend truyền một giá trị không phải ID hợp lệ, nó sẽ bị lỗi CastError ở Pricing.findById().
    // Ta giả định rằng Frontend đang gửi subscriptionId là ID hợp lệ của Pricing.

    // 3. Tính toán Ngày Bắt đầu và Ngày Kết thúc
    const startDate = new Date();
    const endDate = calculateEndDate(
      startDate,
      pricingPackage.rateType,
      pricingPackage.durationValue
    );

    // 4. 🔥 Xử lý Thanh toán (MOCK)
    // Trong ứng dụng thực tế, bạn sẽ gọi API cổng thanh toán ở đây.
    // Nếu thanh toán thất bại, sẽ trả về lỗi 402 hoặc 400.
    // Giả sử thanh toán thành công:

    // 5. Tạo bản ghi Subscription mới
    const newSubscription = await Subscription.create({
      customerName: req.user.name || req.user.username,
      user: userId, // Lấy tên từ User
      pricing: pricingPackage._id,
      startDate: startDate,
      endDate: endDate,
      status: "Active",
      pricePaid: finalPrice, // Giá thực tế đã trả
      discountApplied: discountApplied, // Số tiền giảm nếu có
      // Có thể thêm user: userId để dễ truy vấn sau này
    });
    appEvents.emit(EVENTS.SUBSCRIPTION_PURCHASED, {
      user: userId,
      package: pricingPackage,
      endDate: endDate,
    });
    // 6. Cập nhật thông tin User (nếu cần, ví dụ: lưu lịch sử mua hàng, trừ tiền)
    // const user = await User.findById(userId);
    // user.balance -= pricingPackage.rate;
    // await user.save();

    res.status(201).json({
      message: `✅ Mua gói ${pricingPackage.name} thành công. Gói đã được kích hoạt.`, // Cập nhật thông báo
      subscription: newSubscription,
      pricing: pricingPackage,
    });
  } catch (error) {
    console.error("❌ Lỗi khi mua gói đăng ký:", error.stack); // Xử lý lỗi E11000, lỗi CastError ở đây
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "ID gói không hợp lệ. Vui lòng chọn gói hợp lệ.",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Lỗi Server Nội Bộ khi xử lý mua gói." });
  }
};
export const getMyActiveSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;

    // Tìm các gói Active hoặc Pending của User
    const subs = await Subscription.find({
      user: userId,
      status: { $in: ["Active", "Pending"] },
    })
      .populate("pricing") // Lấy thông tin chi tiết tên gói, giá tiền...
      .sort({ endDate: 1 }); // Sắp xếp gói nào sắp hết hạn lên trước

    res.json(subs);
  } catch (error) {
    console.error("Lỗi lấy subscription:", error);
    res.status(500).json({ message: "Lỗi server khi tải gói đăng ký." });
  }
};
