import Pricing from "../models/Pricing.js"; // 🎯 Đã sửa: Dùng import ES Module
const BASE_URL = "/images/pricing/";
// =================================================================
// @desc  Lấy tất cả thông tin giá (User/Admin)
// @route  GET /api/pricing
// @access Public
// =================================================================
export const getPricing = async (req, res) => {
  try {
    // Lấy tất cả các gói giá đang Active (Công khai cho User)
    const pricingList = await Pricing.find({ isActive: true }).sort({
      vehicleType: 1,
      rateType: -1,
    });
    res.status(200).json(pricingList);
  } catch (error) {
    console.error("❌ LỖI SERVER TRONG getPricing:", error);
    res.status(500).json({
      message:
        "Lỗi Server Nội Bộ khi lấy bảng giá. Vui lòng kiểm tra log backend.",
    });
  }
};

// =================================================================
// @desc  Lấy TẤT CẢ thông tin giá (Kể cả inactive - Chỉ Admin)
// @route  GET /api/pricing/admin
// @access Private/Admin
// =================================================================
export const getAdminPricing = async (req, res) => {
  try {
    const pricingList = await Pricing.find({}).sort({
      vehicleType: 1,
      rateType: -1,
    });
    res.status(200).json(pricingList);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu giá (Admin):", error);
    res.status(500).json({ message: "Lỗi Server Nội Bộ khi lấy bảng giá." });
  }
};

// =================================================================
// 🔥 @desc  Cập nhật giá theo giờ (Hourly Rates) - MULTI-UPDATE (Hàm này có thể bị lỗi)
// 🔥 @route PUT /api/admin/pricing/hourly
// @access Private/Admin
// =================================================================
export const updateHourlyRates = async (req, res) => {
  const { rates } = req.body;

  if (!rates || typeof rates !== "object") {
    return res.status(400).json({ message: "Dữ liệu tỷ lệ giá không hợp lệ." });
  }

  try {
    // Cú pháp findOneAndUpdate/upsert phức tạp, có thể gây lỗi 409/StrictMode
    const updatePromises = Object.keys(rates).map((vehicleType) => {
      const rateValue = parseInt(rates[vehicleType]);
      const packageName = `Hourly Rate - ${vehicleType}`;

      if (isNaN(rateValue) || rateValue < 0) {
        throw new Error(`Giá tiền không hợp lệ cho ${vehicleType}.`);
      }

      const query = { vehicleType: vehicleType, rateType: "Hourly" };

      const update = {
        $set: {
          rate: rateValue,
          isActive: true,
        },
        $setOnInsert: {
          packageName: packageName,
          description: `Giá theo giờ cho ${vehicleType}`,
          rateType: "Hourly",
          vehicleType: vehicleType,
        },
      };

      return Pricing.findOneAndUpdate(query, update, {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      });
    });

    await Promise.all(updatePromises);

    res.status(200).json({ message: "Cập nhật giá theo giờ thành công." });
  } catch (error) {
    console.error("❌ LỖI TRONG updateHourlyRates:", error);

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Lỗi trùng lặp dữ liệu gói giá." });
    } else if (error.name === "StrictModeError") {
      return res.status(500).json({
        message:
          "Lỗi Schema: Thiếu thông tin bắt buộc khi tạo gói giá. Vui lòng kiểm tra lại Pricing Model.",
      });
    }
    res.status(500).json({ message: error.message || "Lỗi Server Nội Bộ." });
  }
};

// =================================================================
// 🔥 @desc  Cập nhật giá theo giờ (Hourly Rates) - SINGLE UPDATE (LOGIC MỚI)
// 🔥 @route PUT /api/admin/pricing/hourly/single
// @access Private/Admin
// =================================================================
export const updateHourlyRateByVehicleType = async (req, res) => {
  const { vehicleType, rate } = req.body;

  if (!vehicleType || !rate) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp loại xe và giá tiền." });
  }

  try {
    const rateValue = parseInt(rate);
    const packageName = `Hourly Rate - ${vehicleType}`;

    if (isNaN(rateValue) || rateValue < 0) {
      return res
        .status(400)
        .json({ message: `Giá tiền không hợp lệ cho ${vehicleType}.` });
    }

    // 1. TÌM DOCUMENT CŨ (Chỉ tìm giá theo giờ của loại xe này)
    const existingPrice = await Pricing.findOne({
      vehicleType: vehicleType,
      rateType: "Hourly",
    });

    if (existingPrice) {
      // 2. NẾU CÓ, CẬP NHẬT TRỰC TIẾP và save()
      existingPrice.rate = rateValue;
      existingPrice.name = packageName; // Đảm bảo trường name luôn có giá trị
      existingPrice.isActive = true;
      await existingPrice.save();

      return res.status(200).json({
        message: `Cập nhật giá ${vehicleType} thành công.`,
        data: existingPrice,
      });
    }

    // 3. NẾU KHÔNG CÓ, TẠO MỚI (vì đã không tìm thấy document cũ)
    const newPricing = await Pricing.create({
      vehicleType: vehicleType,
      rateType: "Hourly",
      rate: rateValue,
      name: packageName,
      isActive: true,
      description: `Giá theo giờ cho ${vehicleType}`,
    });

    res.status(200).json({
      message: `Tạo mới giá ${vehicleType} thành công.`,
      data: newPricing,
    });
  } catch (error) {
    console.error("❌ LỖI TRONG updateHourlyRateByVehicleType:", error);

    if (error.code === 11000) {
      // Lỗi này giờ là lỗi do document cũ bị lỗi (name: null) vẫn tồn tại.
      return res.status(409).json({
        message:
          "Lỗi trùng lặp dữ liệu gói giá. Vui lòng xóa document cũ bị lỗi trong database.",
      });
    }
    res.status(500).json({
      message: error.message || "Lỗi Server Nội Bộ khi cập nhật giá.",
    });
  }
};

// =================================================================
// @desc  Tạo gói giá mới (Chỉ Admin)
// @route  POST /api/pricing/admin
// @access Private/Admin
// =================================================================
export const createPricing = async (req, res) => {
  try {
    const body = req.body;
    const files = req.files || {};

    // Debug để xem server nhận được gì (Bạn có thể xóa sau khi chạy ổn)
    console.log("➡️ Received Body:", body);
    console.log("➡️ Received Files:", files);

    // 1. Xử lý Tên gói (Name)
    // Nếu body.name tồn tại thì trim(), nếu không thì gán null (để Mongoose báo lỗi required chuẩn xác)
    const nameValue = body.name ? body.name.trim() : null;

    // 2. Xử lý Giá và Thời hạn (Number)
    const rateValue = parseInt(body.rate);
    const durationValue = parseInt(body.durationValue) || 1;

    // Kiểm tra thủ công (Optional - giúp trả về lỗi rõ ràng hơn Mongoose)
    if (!nameValue) {
      return res.status(400).json({ message: "Tên gói không được để trống." });
    }
    if (isNaN(rateValue)) {
      return res.status(400).json({ message: "Giá tiền không hợp lệ." });
    }

    // 3. Xử lý Ảnh (Lấy từ Middleware đã lưu)
    const cardImageUrl =
      files.cardImage && files.cardImage[0]
        ? `${BASE_URL}${files.cardImage[0].filename}`
        : Pricing.schema.path("cardImageUrl").options.default;

    const detailImageUrl =
      files.detailImage && files.detailImage[0]
        ? `${BASE_URL}${files.detailImage[0].filename}`
        : Pricing.schema.path("detailImageUrl").options.default;

    // 4. Tạo Database Record
    const newPricing = await Pricing.create({
      name: nameValue,
      vehicleType: body.vehicleType || "Car",
      rateType: body.rateType || "Monthly",
      rate: rateValue,
      durationValue: durationValue,
      description: body.description || "",
      detailDescription: body.detailDescription || "",
      // Chuyển đổi string "true"/"false" thành boolean
      isActive: body.isActive === "true" || body.isActive === true,
      cardImageUrl,
      detailImageUrl,
    });

    res
      .status(201)
      .json({ message: "Tạo gói giá thành công.", data: newPricing });
  } catch (error) {
    console.error("❌ Lỗi createPricing:", error);

    // Xử lý lỗi trùng tên (E11000)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Tên gói này đã tồn tại, vui lòng chọn tên khác." });
    }
    // Xử lý lỗi Validation của Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({ message: "Lỗi Server Nội Bộ." });
  }
};
// =================================================================
// 🔥 @desc  Cập nhật gói dịch vụ (Subscription)
// @route   PUT /api/admin/pricing/:id
// @access  Private/Admin
// =================================================================
export const updateSubscription = async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const files = req.files || {};

  console.log(`➡️ [UPDATE] ID: ${id}`, body);

  try {
    // 1. Tìm gói cũ
    const existingPricing = await Pricing.findById(id);
    if (!existingPricing) {
      return res.status(404).json({ message: "Không tìm thấy gói dịch vụ." });
    }

    // 2. Xử lý dữ liệu text (chỉ cập nhật nếu có gửi lên)
    if (body.name) existingPricing.name = body.name.trim();
    if (body.vehicleType) existingPricing.vehicleType = body.vehicleType;
    if (body.rateType) existingPricing.rateType = body.rateType;
    if (body.rate) existingPricing.rate = parseInt(body.rate);
    if (body.durationValue)
      existingPricing.durationValue = parseInt(body.durationValue);
    if (body.description !== undefined)
      existingPricing.description = body.description;
    if (body.detailDescription !== undefined)
      existingPricing.detailDescription = body.detailDescription;

    // Xử lý isActive (cần thận trọng với boolean/string)
    if (body.isActive !== undefined) {
      existingPricing.isActive =
        body.isActive === "true" || body.isActive === true;
    }

    // 3. Xử lý Ảnh (Chỉ cập nhật nếu có file mới upload)
    if (files.cardImage && files.cardImage[0]) {
      existingPricing.cardImageUrl = `${BASE_URL}${files.cardImage[0].filename}`;
    }
    if (files.detailImage && files.detailImage[0]) {
      existingPricing.detailImageUrl = `${BASE_URL}${files.detailImage[0].filename}`;
    }

    // 4. Lưu thay đổi
    await existingPricing.save();

    res
      .status(200)
      .json({ message: "Cập nhật gói thành công.", data: existingPricing });
  } catch (error) {
    console.error("❌ Lỗi updateSubscription:", error);
    if (error.code === 11000)
      return res.status(400).json({ message: "Tên gói này đã tồn tại." });
    res.status(500).json({ message: "Lỗi Server Nội Bộ." });
  }
};
// =================================================================
// @desc  Cập nhật gói giá (Chỉ Admin)
// @route  PUT /api/pricing/:id
// @access Private/Admin
// =================================================================
export const updatePricingById = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedPricing = await Pricing.findByIdAndUpdate(id, updates, {
      new: true, // Trả về document đã cập nhật
      runValidators: true, // Chạy validator Mongoose
    });

    if (!updatedPricing) {
      return res.status(404).json({ message: "Không tìm thấy gói giá." });
    }

    res
      .status(200)
      .json({ message: "Cập nhật gói giá thành công.", data: updatedPricing });
  } catch (error) {
    console.error("Lỗi khi cập nhật gói giá:", error);
    res.status(500).json({ message: "Lỗi Server Nội Bộ." });
  }
};
// Lấy bảng giá công khai (cho User xem & tính tiền)
export const getPublicPricing = async (req, res) => {
  try {
    // 1. Chỉ lấy các gói giá "Hourly" (Theo giờ) và đang Active
    // 2. Select trường 'rate' (giá tiền) và đổi tên thành 'pricePerHour' cho Frontend dễ hiểu
    // hoặc giữ nguyên 'rate' nhưng Frontend phải sửa theo.
    // Ở đây tôi mapping lại cho khớp với code Frontend chúng ta đã viết: pricePerHour

    const rawPrices = await Pricing.find({
      rateType: "Hourly",
      isActive: true,
    }).select("vehicleType rate -_id");

    // Map dữ liệu để trả về format chuẩn cho Frontend
    const prices = rawPrices.map((p) => ({
      vehicleType: p.vehicleType,
      pricePerHour: p.rate, // 🔥 QUAN TRỌNG: Map từ 'rate' trong DB sang 'pricePerHour'
    }));

    res.status(200).json(prices);
  } catch (error) {
    console.error("Get Public Pricing Error:", error);
    res.status(500).json({ message: "Lỗi lấy bảng giá" });
  }
};
export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Pricing.find({
      isActive: true,
      rateType: { $ne: "Hourly" }, // Lọc các gói không phải Hourly
    }).sort({ durationValue: 1 });
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error("❌ LỖI SERVER TRONG getSubscriptions:", error);
    res.status(500).json({
      message: "Lỗi Server Nội Bộ khi lấy gói đăng ký.",
    });
  }
};
// @desc    Admin lấy danh sách TẤT CẢ Gói cước
// @route   GET /api/admin/pricing
export const getAllPricingAdmin = async (req, res) => {
  try {
    // Lấy danh sách gói + đếm số lượng người đang đăng ký active
    const pricings = await Pricing.find({}).sort({ price: 1 });

    // Tính toán số người đang dùng (Active Users) cho mỗi gói
    const result = await Promise.all(
      pricings.map(async (p) => {
        const count = await Subscription.countDocuments({
          pricing: p._id,
          status: "Active",
          endDate: { $gt: new Date() }, // Còn hạn
        });
        return {
          ...p.toObject(),
          activeUsers: count,
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server." });
  }
};

// @desc    Admin lấy danh sách User đang đăng ký 1 Gói cụ thể
// @route   GET /api/admin/owners/plan/:id
export const getPricingOwners = async (req, res) => {
  try {
    const { id } = req.params;

    const pricing = await Pricing.findById(id);
    if (!pricing) return res.status(404).json({ message: "Gói không tồn tại" });

    // Lấy danh sách đăng ký
    const subs = await Subscription.find({ pricing: id })
      .populate("user", "name email mobile")
      .sort({ endDate: -1 });

    const owners = subs
      .map((sub) => {
        if (!sub.user) return null;
        const isActive =
          sub.status === "Active" && new Date(sub.endDate) > new Date();
        return {
          _id: sub.user._id,
          name: sub.user.name,
          email: sub.user.email,
          mobile: sub.user.mobile,
          detail: `${isActive ? "Đang dùng" : "Hết hạn"}. Hết hạn: ${new Date(
            sub.endDate
          ).toLocaleDateString("vi-VN")}`,
          status: isActive ? "active" : "expired",
        };
      })
      .filter(Boolean);

    res.json({
      item: pricing,
      owners: owners,
      total: owners.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server." });
  }
};
