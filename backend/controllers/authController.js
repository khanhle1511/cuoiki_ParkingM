import User from "../models/User.js";
import VehicleLog from "../models/VehicleLog.js"; // Cần thiết cho getAllUsers và getUserById
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import mongoose from "mongoose";
import Subscription from "../models/Subscription.js";
import UserVoucher from "../models/UserVoucher.js";
import Pricing from "../models/Pricing.js";
import Voucher from "../models/Voucher.js";

// bcryptjs thường đã có nếu file này có chức năng login, hãy kiểm tra
import bcrypt from "bcryptjs";
// @desc Lấy danh sách người sở hữu Gói hoặc Voucher
// @route GET /api/admin/owners/:type/:id
export const getItemOwners = async (req, res) => {
  const { type, id } = req.params;

  try {
    let owners = [];
    let itemDetails = null;

    if (type === "plan") {
      // 1. Lấy thông tin gói
      itemDetails = await Pricing.findById(id);
      // 2. Lấy danh sách người đang đăng ký (Active)
      const subs = await Subscription.find({ pricing: id, status: "Active" })
        .populate("user", "name email mobile")
        .sort({ endDate: -1 });

      owners = subs.map((sub) => ({
        _id: sub.user._id,
        name: sub.user.name,
        email: sub.user.email,
        mobile: sub.user.mobile,
        detail: `Hết hạn: ${new Date(sub.endDate).toLocaleDateString("vi-VN")}`,
      }));
    } else if (type === "voucher") {
      // 1. Lấy thông tin voucher
      itemDetails = await Voucher.findById(id);
      // 2. Lấy danh sách người đang sở hữu (chưa dùng hoặc đã dùng đều được, ở đây lấy 'usable')
      const userVouchers = await UserVoucher.find({ voucher: id }) // Có thể thêm status: 'usable' nếu chỉ muốn xem ai chưa dùng
        .populate("user", "name email mobile")
        .sort({ createdAt: -1 });

      owners = userVouchers.map((uv) => ({
        _id: uv.user._id,
        name: uv.user.name,
        email: uv.user.email,
        mobile: uv.user.mobile,
        detail: `Trạng thái: ${uv.status === "used" ? "Đã dùng" : "Chưa dùng"}`,
      }));
    }

    res.status(200).json({
      item: itemDetails,
      owners: owners,
      total: owners.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách sở hữu" });
  }
};
// =================================================================
// HÀM GỬI EMAIL (Hàm phụ trợ)
// =================================================================
const sendVerificationEmail = async (user) => {
  // Mã OTP 6 chữ số được tạo tự động trong User Model pre-save
  const verificationCode = user.verificationToken;

  const message = `
  <h1>Chào mừng bạn đến với Ứng dụng Quản lý Bãi Đậu Xe!</h1>
  <p>Mã xác thực tài khoản của bạn là:</p>
  <h2 style="color: #4CAF50; font-size: 24px; letter-spacing: 5px;">${verificationCode}</h2>
  <p>Vui lòng sử dụng mã này để xác thực địa chỉ email của bạn.</p>
  <p>Mã này sẽ hết hạn sau 1 giờ.</p>
 `;

  try {
    // CHÚ Ý: KHÔNG AWAIT, chạy bất đồng bộ để không chặn phản hồi đăng ký
    sendEmail({
      email: user.email,
      subject: "Mã Xác Thực Email (OTP) Của Bạn",
      message,
    });
    console.log(`✅ Đã gửi mã OTP (${verificationCode}) tới: ${user.email}`);
  } catch (err) {
    console.error(`❌ LỖI GỬI EMAIL XÁC THỰC: ${err.message}`); // Vẫn tiếp tục xử lý đăng ký thành công nếu lỗi này xảy ra
  }
};

// =================================================================
// @desc  Đăng ký người dùng mới
// @route  POST /api/auth/register
// @access Public
// =================================================================
export const registerUser = async (req, res, next) => {
  const { name, email, username, password, mobile } = req.body;

  try {
    // 1. Kiểm tra User đã tồn tại chưa
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "Người dùng đã tồn tại với email này." });
    } // 2. Tạo User Mới (verificationToken và Expires được tạo trong pre-save hook)

    const newUser = await User.create({
      name,
      email,
      mobile,
      username,
      password,
      isVerified: false, // Mặc định chưa xác thực
    });

    if (newUser) {
      // 3. Gửi Email Xác thực (KHÔNG AWAIT)
      sendVerificationEmail(newUser); // 4. GỬI PHẢN HỒI THÀNH CÔNG

      return res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        message:
          "Đăng ký thành công. Mã xác thực đã được gửi đến email của bạn.",
        redirectTo: "/verify-email",
      });
    } else {
      return res
        .status(400)
        .json({ message: "Dữ liệu người dùng không hợp lệ." });
    }
  } catch (error) {
    console.error("❌ LỖI TRONG REGISTER CONTROLLER:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Username hoặc Email đã được sử dụng." });
    } // Xử lý lỗi Mongoose Validation
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    return res.status(500).json({ message: "Lỗi Server Nội Bộ khi đăng ký." });
  }
};

// =================================================================
// @desc  Xác thực Mã OTP (Khi đăng ký)
// @route  POST /api/auth/verify-code
// @access Public
// =================================================================
export const verifyCode = async (req, res, next) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp email và mã xác thực." });
  }

  try {
    // 1. Tìm User bằng email và mã code, đồng thời kiểm tra token còn hạn không
    const user = await User.findOne({
      email,
      verificationToken: code,
      verificationTokenExpires: { $gt: Date.now() }, // Token còn hạn
    });

    if (!user) {
      // Trường hợp: Sai mã code HOẶC mã đã hết hạn
      const userOnly = await User.findOne({ email });
      let message = "Mã xác thực không hợp lệ.";

      if (userOnly && userOnly.isVerified) {
        message = "Tài khoản này đã được xác thực trước đó.";
      } else if (
        userOnly &&
        userOnly.verificationTokenExpires &&
        userOnly.verificationTokenExpires < Date.now()
      ) {
        message =
          "Mã xác thực đã hết hạn. Vui lòng đăng nhập lại để nhận mã mới.";
      }

      return res.status(400).json({ message });
    } // 2. Xác thực thành công: Cập nhật User

    user.isVerified = true;
    user.verificationToken = undefined; // Xóa mã code
    user.verificationTokenExpires = undefined; // Xóa thời gian hết hạn

    await user.save(); // Lưu thay đổi vào DB // 3. Gửi phản hồi thành công (KHÔNG GỬI TOKEN)

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      isVerified: user.isVerified,
      message: "Xác thực thành công. Vui lòng đăng nhập.",
      redirectTo: "/login",
    });
  } catch (error) {
    console.error("❌ LỖI TRONG VERIFY CODE CONTROLLER:", error);
    return res
      .status(500)
      .json({ message: "Lỗi Server Nội Bộ khi xác thực mã." });
  }
};

// =================================================================
// @desc  Đăng nhập người dùng
// @route  POST /api/auth/login
// @access Public
// =================================================================
export const loginUser = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp tên đăng nhập và mật khẩu." });
  }

  try {
    // 1. Tìm người dùng bằng username và lấy cả trường password
    const user = await User.findOne({ username }).select("+password"); // 2. Kiểm tra user có tồn tại VÀ mật khẩu có khớp không

    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ message: "Tên đăng nhập hoặc mật khẩu không chính xác." });
    } // 3. Kiểm tra người dùng đã xác thực email chưa

    if (!user.isVerified) {
      return res.status(401).json({
        message:
          "Tài khoản chưa được xác thực. Vui lòng kiểm tra email của bạn.",
        redirectTo: "/verify-email",
        email: user.email,
      });
    } // 4. Mọi thứ OK -> Tạo Token

    const token = generateToken(user._id); // Gửi thông tin người dùng về (không kèm mật khẩu)
    let isParking = false;
    let logData = null; // Tùy chọn, để gửi thông tin log nếu cần

    if (user.role === "User") {
      const activeLog = await VehicleLog.findOne({
        user: user._id,
        status: "parked",
      });

      if (activeLog) {
        isParking = true;
        logData = {
          _id: activeLog._id,
          licensePlate: activeLog.licensePlate,
          // ... (thêm các trường khác nếu cần)
        };
      }
    }
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      token: token, // Frontend sẽ lưu token này
      isParking: isParking,
      activeLog: logData, // Tùy chọn, để frontend có thể lưu luôn
    });
  } catch (error) {
    console.error("❌ LỖI TRONG LOGIN CONTROLLER:", error);
    return res
      .status(500)
      .json({ message: "Lỗi Server Nội Bộ khi đăng nhập." });
  }
};

// =================================================================
// @desc  Lấy Profile người dùng
// @route  GET /api/auth/profile
// @access Private
// =================================================================
export const getUserProfile = async (req, res, next) => {
  try {
    // Dữ liệu người dùng đã được lấy từ req.user bởi protect middleware
    if (req.user) {
      res.status(200).json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        username: req.user.username,
        role: req.user.role,
        isVerified: req.user.isVerified,
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy người dùng." });
    }
  } catch (error) {
    console.error("❌ LỖI TRONG GET PROFILE CONTROLLER:", error);
    return res
      .status(500)
      .json({ message: "Lỗi Server Nội Bộ khi lấy thông tin người dùng." });
  }
};

// =================================================================
// @desc  Cập nhật mật khẩu (Người dùng tự cập nhật)
// @route  PUT /api/auth/password
// @access Private
// =================================================================
export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }
    const activeLog = await VehicleLog.findOne({
      user: user._id,
      status: "parked",
    });

    if (!(await user.matchPassword(oldPassword))) {
      return res.status(401).json({ message: "Mật khẩu cũ không chính xác." });
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({ message: "Cập nhật mật khẩu thành công." });
  } catch (error) {
    console.error("❌ LỖI TRONG UPDATE PASSWORD CONTROLLER:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    return res
      .status(500)
      .json({ message: "Lỗi Server Nội Bộ khi cập nhật mật khẩu." });
  }
};

// =================================================================
// @desc  Xác thực Email (link cũ - Tạm thời không dùng)
// @route  GET /api/auth/verify/:token
// @access Public
// =================================================================
export const verifyEmail = async (req, res, next) => {
  return res.status(400).json({
    message:
      "Verify Email (link) không còn được sử dụng. Vui lòng sử dụng POST /verify-code.",
  });
};

// =================================================================
// === 🚀 TÍNH NĂNG MỚI: QUÊN MẬT KHẨU ===
// =================================================================

/**
 * @desc  Bước 1: Yêu cầu reset mật khẩu (gửi OTP)
 * @route  POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`(Quên MK) Email không tồn tại: ${email}`);
      return res.status(200).json({
        message: "Nếu email này tồn tại, một mã khôi phục đã được gửi.",
      });
    }
    const min = 100000;
    const max = 999999;
    const otp = String(Math.floor(Math.random() * (max - min + 1)) + min);
    user.verificationToken = otp;
    user.verificationTokenExpires = Date.now() + 2 * 60 * 1000; // 2 phút
    await user.save();
    const message = `
   <h1>Yêu cầu Khôi phục Mật khẩu</h1>
   <p>Bạn đã yêu cầu khôi phục mật khẩu. Mã OTP của bạn là:</p>
   <h2 style="color: #FF5722; font-size: 24px; letter-spacing: 5px;">${otp}</h2>
   <p>Mã này sẽ hết hạn sau 2 phút. Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
  `;
    sendEmail({
      email: user.email,
      subject: "Mã Khôi Phục Mật Khẩu (OTP)",
      message,
    });
    console.log(`✅ Đã gửi mã OTP (Quên MK) tới: ${user.email}`);
    return res.status(200).json({
      message: "Mã khôi phục đã được gửi đến email của bạn.",
    });
  } catch (error) {
    console.error("❌ LỖI TRONG FORGOT PASSWORD:", error);
    return res
      .status(500)
      .json({ message: "Lỗi Server Nội Bộ khi gửi mã khôi phục." });
  }
};

/**
 * @desc  Bước 2: Xác thực mã OTP để reset
 * @route  POST /api/auth/verify-reset-code
 * @access Public
 */
export const verifyResetCode = async (req, res, next) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: "Vui lòng cung cấp email và mã." });
  }
  try {
    const user = await User.findOne({
      email,
      verificationToken: code,
      verificationTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Mã không hợp lệ hoặc đã hết hạn." });
    }
    return res.status(200).json({
      message: "Mã hợp lệ. Vui lòng đặt mật khẩu mới.",
      resetToken: user.verificationToken, // Gửi lại OTP
      M,
    });
  } catch (error) {
    console.error("❌ LỖI TRONG VERIFY RESET CODE:", error);
    return res
      .status(500)
      .json({ message: "Lỗi Server Nội Bộ khi xác thực mã." });
  }
};

/**
 * @desc  Bước 3: Đặt lại mật khẩu mới
 * @route  POST /api/auth/reset-password
 * @access Public
 */
export const resetPassword = async (req, res, next) => {
  const { email, newPassword, resetToken } = req.body;
  if (!email || !newPassword || !resetToken) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp đầy đủ thông tin." });
  }
  try {
    const user = await User.findOne({
      email,
      verificationToken: resetToken,
      verificationTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        message: "Mã không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
      });
    }
    user.password = newPassword;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    return res.status(200).json({
      message: "Cập nhật mật khẩu thành công. Vui lòng đăng nhập.",
    });
  } catch (error) {
    console.error("❌ LỖI TRONG RESET PASSWORD:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    return res
      .status(500)
      .json({ message: "Lỗi Server Nội Bộ khi đặt lại mật khẩu." });
    D;
  }
};

// =================================================================
// === 🚀 TÍNH NĂNG ADMIN ===
// =================================================================

/**
 * @desc  Lấy danh sách tất cả người dùng
 * @route  GET /api/auth/all-users
 * @access Private/Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    // 1. Lấy tất cả người dùng (dạng .lean() cho nhanh)
    const users = await User.find({}).select("-password").lean(); // 2. Lấy TẤT CẢ các log xe đang hoạt động (parked)

    const activeLogs = await VehicleLog.find({ status: "parked" })
      .populate("parkingSlot", "name")
      .lean(); // 3. Lấy TẤT CẢ log (kể cả đã hoàn thành) để tính tổng số lần đỗ

    const allLogs = await VehicleLog.find({}).lean(); // 4. Tạo Map (bảng tra cứu) cho log đang hoạt động

    const activeLogMap = new Map(
      activeLogs.map((log) => [log.user.toString(), log])
    ); // 5. Tính toán tổng số lần đỗ cho TỪNG người dùng

    const parkingCountMap = new Map();

    allLogs.forEach((log) => {
      // Bỏ qua log đang hoạt động (vì nó nằm trong activeLogMap)
      // 🚀 SỬA LOGIC: Vẫn đếm, nhưng không push vào history
      const userId = log.user.toString();
      const vehicleType = log.vehicleType;

      if (!parkingCountMap.has(userId)) {
        parkingCountMap.set(userId, {
          car: 0,
          motorbike: 0,
          bicycle: 0,
          history: [],
        });
      }
      const counts = parkingCountMap.get(userId);
      if (counts.hasOwnProperty(vehicleType)) {
        counts[vehicleType]++;
      }

      // Chỉ push vào history nếu log đã "completed"
      if (log.status === "completed") {
        counts.history.push({
          _id: log._id,
          plate: log.licensePlate,
          type: log.vehicleType,
          checkIn: log.checkInTime,
          checkOut: log.checkOutTime,
          status: log.status,
        });
      }
    }); // 6. Kết hợp dữ liệu

    let usersWithStatus = users.map((user) => {
      const activeLog = activeLogMap.get(user._id.toString());
      const parkingStats = parkingCountMap.get(user._id.toString()) || {
        car: 0,
        motorbike: 0,
        bicycle: 0,
        history: [],
      };

      return {
        ...user,
        activeLog: activeLog || null,
        parkingStats: {
          totalCar: parkingStats.car,
          totalMotorbike: parkingStats.motorbike,
          totalBicycle: parkingStats.bicycle,
          parkingHistory: parkingStats.history,
        },
      };
    });

    res.status(200).json(usersWithStatus);
  } catch (error) {
    console.error("❌ LỖI TRONG GET ALL USERS:", error);
    res.status(500).json({ message: "Lỗi Server Nội Bộ." });
  }
};

// =================================================================
// @desc  (MỚI) Admin lấy chi tiết 1 người dùng bằng ID
// @route  GET /api/auth/user/:id
// @access Private/Admin
// =================================================================
export const getUserById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID người dùng không hợp lệ." });
  }

  try {
    // 1. Lấy thông tin user
    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    } // 2. 🔥 SỬA LỖI TẠI ĐÂY: Đảm bảo populate được thực thi (Mongoose Query Object)

    const activeLogQuery = VehicleLog.findOne({
      user: user._id,
      status: { $regex: /park|in|active/i },
    })
      .populate("parkingSlot", "name")
      .lean();

    const activeLog = await activeLogQuery;

    // 🔥🔥 BẮT BUỘC AWAIT QUERY ĐỂ LẤY KẾT QUẢ // 3. Lấy TẤT CẢ log đã hoàn thành để tính thống kê VÀ lịch sử

    const completedLogs = await VehicleLog.find({
      user: user._id,
      status: { $regex: /complet|out|done|finish/i },
    }).lean();

    // 🚀 LÔ-GIC MỚI: Xử lý trường hợp ParkingSlot bị mất/null (Data Integrity Error)
    let finalActiveLog = activeLog;
    if (activeLog && !activeLog.parkingSlot) {
      // Nếu activeLog có, nhưng parkingSlot là null (ID không tồn tại)
      console.warn(
        `[DATA ERROR] Active Log ${activeLog._id} points to a missing ParkingSlot ID.`
      );
      finalActiveLog = {
        ...activeLog,
        parkingSlot: { name: "ĐÃ XÓA/LỖI DỮ LIỆU" }, // Gán giá trị để Frontend hiển thị thông báo lỗi rõ ràng
      };
    } // 4. Tính toán thống kê (Giữ nguyên)

    const stats = { totalCar: 0, totalMotorbike: 0, totalBicycle: 0 };
    completedLogs.forEach((log) => {
      if (log.vehicleType === "car") stats.totalCar++;
      if (log.vehicleType === "motorbike") stats.totalMotorbike++;
      if (log.vehicleType === "bicycle") stats.totalBicycle++;
    }); // 5. Gộp dữ liệu và trả về

    res.status(200).json({
      ...user,
      activeLog: finalActiveLog || null,
      parkingStats: stats,
      parkingHistory: completedLogs,
    });
  } catch (error) {
    console.error("❌ LỖI TRONG GET USER BY ID:", error);
    res.status(500).json({ message: "Lỗi Server Nội Bộ." });
  }
};

/**
 * @desc  Admin cập nhật thông tin người dùng
 * @route  PATCH /api/auth/user/:id
 * @access Private/Admin
 */
export const updateUserByAdmin = async (req, res) => {
  const { id } = req.params;
  // 🚀 CẬP NHẬT: Thêm 'notes'
  const { name, username, mobile, licensePlate, password, notes } = req.body;

  try {
    // 1. Tìm người dùng cần cập nhật
    const userToUpdate = await User.findById(id).select("+password");

    if (!userToUpdate) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    } // 2. Chỉ cho phép cập nhật các trường được gửi (Nếu tồn tại)

    if (name !== undefined) userToUpdate.name = name;
    if (mobile !== undefined) userToUpdate.mobile = mobile;
    if (licensePlate !== undefined) userToUpdate.licensePlate = licensePlate;
    // 🚀 CẬP NHẬT: Thêm 'notes'
    if (notes !== undefined) userToUpdate.notes = notes;

    if (username !== undefined) {
      // Kiểm tra trùng lặp username (trừ chính user đó)
      const usernameExists = await User.findOne({
        username,
        _id: { $ne: id },
      });
      if (usernameExists) {
        return res
          .status(400)
          .json({ message: "Tên đăng nhập đã được sử dụng." });
      }
      userToUpdate.username = username;
    } // 4. Cập nhật mật khẩu (nếu có)

    if (password) {
      userToUpdate.password = password; // Mongoose pre-save hook sẽ tự động hash
    } // 5. Lưu và trả về kết quả

    const updatedUser = await userToUpdate.save(); // Trả về thông tin người dùng đã cập nhật (không kèm mật khẩu)

    return res.status(200).json({
      message: "Cập nhật thông tin người dùng thành công.",
      user: {
        // 🚀 Gửi lại user data đã update để frontend cập nhật placeholder
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        mobile: updatedUser.mobile,
        licensePlate: updatedUser.licensePlate,
        notes: updatedUser.notes, // 🚀 CẬP NHẬT: Thêm 'notes'
      },
    });
  } catch (error) {
    console.error("❌ LỖI TRONG UPDATE USER BY ADMIN:", error); // Xử lý lỗi trùng lặp (E11000)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Username hoặc Mobile đã tồn tại trong hệ thống." });
    } // Xử lý lỗi Mongoose Validation
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    return res.status(500);
    t.json({ message: "Lỗi Server Nội Bộ khi cập nhật người dùng." });
  }
};

/**
 * @desc  Admin xóa người dùng
 * @route  DELETE /api/auth/user/:id
 * @access Private/Admin
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params; // Nếu id không phải là ObjectId hợp lệ, trả về lỗi 400

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID người dùng không hợp lệ." });
  }

  try {
    // 1. Tìm người dùng cần xóa
    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    } // 2. Bảo vệ: Không cho phép xóa tài khoản Admin (trừ khi có logic đặc biệt)

    if (userToDelete.role.toLowerCase() === "admin") {
      // Kiểm tra xem có phải Admin đang tự xóa mình không (Nếu cần)
      if (req.user._id.toString() === id) {
        return res.status(403).json({
          message: "Không thể tự xóa tài khoản quản trị viên của bạn.",
        });
      }
      return res
        .status(403)
        .json({ message: "Không được phép xóa tài khoản quản trị viên khác." });
    } // 3. Xóa người dùng

    await userToDelete.deleteOne();

    return res.status(200).json({
      message: `Người dùng ${userToDelete.username} đã được xóa thành công.`,
    });
  } catch (error) {
    console.error("❌ LỖI TRONG DELETE USER:", error);
    return res
      .status(500)
      .json({ message: "Lỗi Server Nội Bộ khi xóa người dùng." });
  }
};
// =================================================================
// 🟢 1. LẤY TOÀN BỘ HỒ SƠ (Aggregator)
// @route GET /api/users/profile/full
// =================================================================
export const getUserFullProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Chạy song song các truy vấn để tối ưu tốc độ
    const [user, subscriptions, vouchers, logs] = await Promise.all([
      // A. Lấy thông tin User
      User.findById(userId).select("-password"),

      // B. Lấy Lịch sử gói cước
      Subscription.find({ user: userId })
        .populate("pricing")
        .sort({ endDate: -1 }),

      // C. Lấy Voucher đang sở hữu
      UserVoucher.find({ user: userId })
        .populate("voucher")
        .sort({ createdAt: -1 }),

      // D. Lấy Lịch sử đỗ xe (50 lần gần nhất)
      VehicleLog.find({ user: userId })
        .populate("parkingSlot")
        .sort({ checkInTime: -1 })
        .limit(50),
    ]);

    // E. Tính toán thống kê (Tổng tiền & Tổng lượt)
    const totalSpentLog = await VehicleLog.aggregate([
      // 1. Lọc ra các xe của user này và đã trả xe (CHECKED_OUT)
      { $match: { user: userId, status: "CHECKED_OUT" } },
      {
        $group: {
          _id: null,
          // ❌ CŨ: total: { $sum: { $toDouble: "$totalFee" } },
          // ✅ MỚI: Đổi tên trường thành totalAmount cho khớp với Database
          total: { $sum: { $toDouble: "$totalAmount" } },
        },
      },
    ]);

    const totalParkingCount = await VehicleLog.countDocuments({ user: userId });

    res.json({
      user,
      stats: {
        // Lấy kết quả tổng (nếu mảng rỗng thì trả về 0)
        totalSpending: totalSpentLog.length > 0 ? totalSpentLog[0].total : 0,
        parkingCount: totalParkingCount,
      },
      subscriptions,
      vouchers,
      logs,
    });
  } catch (error) {
    console.error("Lỗi lấy hồ sơ đầy đủ:", error);
    res.status(500).json({ message: "Lỗi server khi tải hồ sơ." });
  }
};

// =================================================================
// 🟢 2. CẬP NHẬT THÔNG TIN CƠ BẢN
// @route PUT /api/users/profile/update-info
// =================================================================
export const updateUserProfileInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email } = req.body;

    const user = await User.findById(userId);

    if (user) {
      user.name = name || user.name;
      // user.email = email || user.email; // Tùy chọn: Có cho đổi email không?

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        // Trả lại token cũ (hoặc tạo mới nếu cần) để Frontend cập nhật state
        token: req.headers.authorization.split(" ")[1],
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    console.error("Lỗi cập nhật:", error);
    res.status(500).json({ message: "Lỗi cập nhật thông tin." });
  }
};

// =================================================================
// 🟢 3. ĐỔI MẬT KHẨU
// @route PUT /api/users/profile/change-password
// =================================================================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    // Kiểm tra mật khẩu cũ
    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword; // Middleware 'pre save' của User Model sẽ tự mã hóa
      await user.save();
      res.json({ message: "Đổi mật khẩu thành công!" });
    } else {
      res.status(401).json({ message: "Mật khẩu hiện tại không đúng." });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi đổi mật khẩu: " + error.message });
  }
};
