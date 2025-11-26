import Voucher from "../models/Voucher.js";
import UserVoucher from "../models/UserVoucher.js";
import User from "../models/User.js"; // Cần import User để kiểm tra tồn tại khi tặng
import appEvents from "../utils/eventEmitter.js";
import { EVENTS } from "../services/notificationService.js";
// @desc    Lấy danh sách tất cả Voucher (Admin: lấy hết)
// @route   GET /api/admin/vouchers (hoặc /api/vouchers tùy route bạn đặt)
export const getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy danh sách voucher" });
  }
};

// @desc    Tạo Voucher mới
// @route   POST /api/admin/vouchers
export const createVoucher = async (req, res) => {
  try {
    const { code } = req.body;

    const exists = await Voucher.findOne({ code });
    if (exists)
      return res.status(400).json({ message: "Mã voucher này đã tồn tại" });

    const voucher = await Voucher.create(req.body);
    res.status(201).json(voucher);
  } catch (error) {
    res.status(400).json({ message: "Dữ liệu không hợp lệ: " + error.message });
  }
};

// @desc    Cập nhật Voucher
// @route   PUT /api/admin/vouchers/:id
export const updateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!voucher)
      return res.status(404).json({ message: "Không tìm thấy voucher" });
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật voucher: " + error.message });
  }
};

// @desc    Toggle trạng thái Active/Inactive
// @route   PATCH /api/admin/vouchers/:id/toggle
export const toggleActiveStatus = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher)
      return res.status(404).json({ message: "Không tìm thấy voucher" });

    // Đảo ngược trạng thái
    voucher.isActive = !voucher.isActive;
    await voucher.save();

    res.json({
      message: `Voucher ${voucher.code} đã được ${
        voucher.isActive ? "MỞ" : "KHÓA"
      }`,
      voucher,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đổi trạng thái voucher" });
  }
};

// @desc    Xóa Voucher
// @route   DELETE /api/admin/vouchers/:id
export const deleteVoucher = async (req, res) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa voucher" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa voucher" });
  }
};

// @desc    Lấy danh sách Voucher CÓ SẴN cho User (Đã lọc theo giới hạn sử dụng)
// @route   GET /api/vouchers/available
// @access  Protected (User)
export const getAvailableVouchers = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Lấy tất cả voucher đang chạy và chưa hết hạn
    //    Và chưa hết lượt sử dụng CHUNG (toàn hệ thống)
    const allVouchers = await Voucher.find({
      isActive: true,
      expirationDate: { $gt: new Date() },
      $expr: { $lt: ["$usedCount", "$usageLimit"] },
    }).sort({ createdAt: -1 });

    // 2. Kiểm tra lịch sử sử dụng của User với từng voucher (giới hạn CÁ NHÂN)
    const availableVouchers = await Promise.all(
      allVouchers.map(async (voucher) => {
        // Đếm số lần user đã nhận/dùng voucher này
        const userUsageCount = await UserVoucher.countDocuments({
          user: userId,
          voucher: voucher._id,
        });

        // Kiểm tra giới hạn cá nhân (mặc định 1 nếu không set)
        const maxPerUser = voucher.maxUsagePerUser || 1;
        const isEligible = userUsageCount < maxPerUser;

        // Trả về voucher kèm cờ (flag) để frontend biết
        return {
          ...voucher.toObject(), // Chuyển mongoose doc sang object thường
          isEligible: isEligible, // User có được dùng tiếp không?
          userUsageCount: userUsageCount, // Đã dùng bao nhiêu lần
          maxUsagePerUser: maxPerUser, // Giới hạn là bao nhiêu
        };
      })
    );

    res.json(availableVouchers);
  } catch (error) {
    console.error("Lỗi lấy voucher khả dụng:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách voucher: " + error.message,
    });
  }
};

// @desc    Lấy danh sách Voucher CÁ NHÂN của User
// @route   GET /api/user/vouchers/mine
// @access  Protected (User)
export const getMyVouchers = async (req, res) => {
  const userId = req.user._id;

  try {
    // 1. Tìm tất cả UserVoucher của user
    // 2. Populate để lấy thông tin chi tiết từ bảng Voucher gốc
    const myVouchers = await UserVoucher.find({ user: userId })
      .populate("voucher")
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    // 3. Lọc bỏ các voucher mà voucher gốc đã bị xóa (null)
    const validVouchers = myVouchers.filter((item) => item.voucher !== null);

    // 🔥 Lọc trùng lặp ngay tại Backend (phòng hường Database bị lỗi trước đó)
    // Dùng Map để giữ lại voucher đầu tiên gặp (theo voucher ID)
    const uniqueVouchers = Array.from(
      new Map(
        validVouchers.map((item) => [item.voucher._id.toString(), item])
      ).values()
    );

    res.json(uniqueVouchers);
  } catch (error) {
    console.error("Lỗi lấy voucher cá nhân:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách voucher cá nhân.",
    });
  }
};

// @desc    ADMIN TẶNG VOUCHER THỦ CÔNG CHO USER
// @route   POST /api/admin/vouchers/grant
// @body    { userId, voucherId }
export const grantVoucherToUser = async (req, res) => {
  const { userId, voucherId } = req.body;

  try {
    // 1. Kiểm tra User và Voucher có tồn tại không
    const user = await User.findById(userId);
    const voucher = await Voucher.findById(voucherId);

    if (!user || !voucher) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy User hoặc Voucher" });
    }

    if (!voucher.isActive) {
      return res
        .status(400)
        .json({ message: "Voucher này đang bị khóa, không thể tặng." });
    }

    // 2. Kiểm tra giới hạn sở hữu (tránh tặng quá số lượng cho phép)
    const receivedCount = await UserVoucher.countDocuments({
      user: userId,
      voucher: voucherId,
    });

    const maxPerUser = voucher.maxUsagePerUser || 1;

    // Nếu đã nhận đủ số lượng cho phép
    if (receivedCount >= maxPerUser) {
      return res.status(400).json({
        message: `User này đã đạt giới hạn nhận voucher này (${receivedCount}/${maxPerUser}).`,
      });
    }

    // 3. Tạo bản ghi UserVoucher mới
    await UserVoucher.create({
      user: userId,
      voucher: voucherId,
      status: "usable",
      source: "admin_grant", // Đánh dấu là do admin tặng
    });
    appEvents.emit(EVENTS.VOUCHER_GRANTED, {
      user: userId,
      voucher: voucher, // Truyền toàn bộ object voucher (để lấy code, tên,...)
      source: "admin_grant",
    });
    res.status(200).json({
      message: `Đã tặng voucher ${voucher.code} cho user ${user.name}`,
    });
  } catch (error) {
    console.error("Lỗi tặng voucher:", error);
    res.status(500).json({ message: "Lỗi server khi tặng voucher." });
  }
};
// @desc    Admin lấy danh sách TẤT CẢ Voucher (kèm thống kê)
// @route   GET /api/admin/vouchers
export const getAllVouchersAdmin = async (req, res) => {
  try {
    // Lấy tất cả voucher, sắp xếp mới nhất
    const vouchers = await Voucher.find({}).sort({ createdAt: -1 });

    // (Optional) Nếu muốn tính toán thêm gì đó thì map ở đây
    // Ví dụ: Đã dùng bao nhiêu %...

    res.json(vouchers);
  } catch (error) {
    console.error("Lỗi lấy danh sách voucher admin:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};

// @desc    Admin lấy danh sách User sở hữu 1 Voucher cụ thể
// @route   GET /api/admin/owners/voucher/:id
export const getVoucherOwners = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Lấy thông tin voucher gốc
    const voucher = await Voucher.findById(id);
    if (!voucher) {
      return res.status(404).json({ message: "Không tìm thấy voucher" });
    }

    // 2. Tìm tất cả UserVoucher liên quan
    const userVouchers = await UserVoucher.find({ voucher: id })
      .populate("user", "name email mobile") // Lấy thông tin user
      .sort({ createdAt: -1 });

    // 3. Format dữ liệu trả về
    const owners = userVouchers
      .map((uv) => {
        if (!uv.user) return null; // Bỏ qua nếu user đã bị xóa
        return {
          _id: uv.user._id,
          name: uv.user.name,
          email: uv.user.email,
          mobile: uv.user.mobile,
          detail: `Trạng thái: ${
            uv.status === "used" ? "Đã sử dụng" : "Chưa dùng"
          }`,
          status: uv.status,
          grantedAt: uv.createdAt,
        };
      })
      .filter(Boolean); // Lọc bỏ null

    res.json({
      item: voucher,
      owners: owners,
      total: owners.length,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách sở hữu voucher:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};
