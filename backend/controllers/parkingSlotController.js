import ParkingSlot from "../models/ParkingSlot.js";
import VehicleLog from "../models/VehicleLog.js"; // 🚀 Cần thiết cho populate
import User from "../models/User.js";

// === HÀM HỖ TRỢ: Lấy prefix và vehicleType dựa trên khu vực ===
const getSlotDetailsFromArea = (area) => {
  switch (area) {
    case "motorbike":
      return { prefix: "XM", vehicleType: "motorbike" };
    case "bicycle":
      return { prefix: "XD", vehicleType: "bicycle" };
    case "car-1":
      return { prefix: "OT1", vehicleType: "car" };
    case "car-2":
      return { prefix: "OT2", vehicleType: "car" };
    default: // Ném lỗi nếu khu vực không khớp
      throw new Error("Khu vực không hợp lệ.");
  }
};

/**
 * @desc  (User) Lấy danh sách chỗ đỗ CÒN TRỐNG theo loại xe
 * @route  GET /api/parking/available/:type
 * @access Private (User)
 */
export const getAvailableSlotsByType = async (req, res) => {
  try {
    const vehicleType = req.params.type; // Lấy các chỗ trống (available) VÀ đúng loại xe
    const slots = await ParkingSlot.find({
      vehicleType: vehicleType,
      status: "available",
    }).sort({ name: 1 }); // Sắp xếp theo tên

    res.status(200).json(slots);
  } catch (error) {
    console.error("❌ LỖI TRONG GET AVAILABLE SLOTS:", error);
    res.status(500).json({ message: "Lỗi Server Nội Bộ." });
  }
};

/**
 * @desc  (Admin) Lấy TẤT CẢ chỗ đỗ (mọi trạng thái)
 * @route  GET /api/parking/all
 * @access Private (Admin)
 */
export const getAllSlots = async (req, res) => {
  try {
    // 🚀 CẬP NHẬT: Populate lồng nhau để lấy thông tin User
    const slots = await ParkingSlot.find({})
      .populate({
        path: "currentLog",
        select: "licensePlate user checkInTime", // Lấy các trường từ VehicleLog
        populate: {
          path: "user", // Populate lồng: lấy 'user' từ 'currentLog'
          select: "name email", // 🚀 Lấy Tên và Email (bạn có thể thêm 'phoneNumber' nếu có)
        },
      })
      .sort({ name: 1 });

    res.status(200).json(slots);
  } catch (error) {
    console.error("❌ LỖI TRONG GET ALL SLOTS:", error);
    res.status(500).json({ message: "Lỗi Server Nội Bộ." });
  }
};

/**
 * @desc  (Admin) Tạo một chỗ đỗ mới (TỰ ĐỘNG TẠO TÊN)
 * @route  POST /api/parking
 * @access Private (Admin)
 */
export const createSlot = async (req, res) => {
  // 🚀 THAY ĐỔI: Chỉ nhận 'area' và 'notes'
  const { area, notes } = req.body;

  if (!area) {
    return res.status(400).json({ message: "Vui lòng chọn Khu Vực." });
  }

  try {
    // 1. Lấy Prefix và vehicleType
    const { prefix, vehicleType } = getSlotDetailsFromArea(area);

    // 2. Tìm số thứ tự lớn nhất của khu vực này
    const lastSlot = await ParkingSlot.findOne({
      area: area,
    }).sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo

    let newSlotNumber = 1;
    if (lastSlot) {
      // Tách số ra khỏi tên (ví dụ: "XM-12" -> "12")
      const lastNumber = parseInt(lastSlot.name.split("-")[1] || 0);
      newSlotNumber = lastNumber + 1;
    }

    // 3. Tạo tên mới
    const newName = `${prefix}-${newSlotNumber}`;

    // 4. Kiểm tra lần nữa (hiếm khi xảy ra)
    const nameExists = await ParkingSlot.findOne({ name: newName });
    if (nameExists) {
      return res
        .status(400)
        .json({ message: "Tên tự động tạo bị trùng, vui lòng thử lại." });
    }

    // 5. Tạo slot
    const slot = await ParkingSlot.create({
      name: newName,
      vehicleType: vehicleType,
      area: area,
      notes: notes || "",
      status: "available",
    });

    res.status(201).json(slot);
  } catch (error) {
    console.error("❌ LỖI TRONG CREATE SLOT (Tự động):", error); // Xử lý lỗi nếu getSlotDetailsFromArea ném ra
    if (error.message === "Khu vực không hợp lệ.") {
      return res.status(400).json({ message: "Khu vực không hợp lệ." });
    }
    res.status(500).json({ message: "Lỗi Server Nội Bộ." });
  }
};

/**
 * @desc  (Admin) Khóa hoặc Mở khóa một chỗ đỗ (Toggle)
 * @route  PUT /api/parking/:id/status
 * @access Private (Admin)
 */
export const toggleSlotStatus = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ message: "Không tìm thấy chỗ đỗ." });
    }

    if (slot.status === "occupied") {
      return res.status(400).json({
        message: "Không thể khóa chỗ đỗ đang có xe. Vui lòng chờ xe check-out.",
      });
    }

    if (slot.status === "available") {
      slot.status = "maintenance"; // Khóa lại
    } else {
      slot.status = "available"; // Mở ra
    }

    await slot.save();
    res.status(200).json(slot);
  } catch (error) {
    console.error("❌ LỖI TRONG TOGGLE SLOT STATUS:", error);
    res.status(500).json({ message: "Lỗi Server Nội Bộ." });
  }
};

/**
 * @desc  (Admin) Sửa thông tin một chỗ đỗ
 * @route  PUT /api/parking/:id
 * @access Private (Admin)
 */
export const updateSlot = async (req, res) => {
  // 🚀 THAY ĐỔI: Chỉ cho phép sửa 'area' và 'notes'
  const { area, notes } = req.body;
  const slotId = req.params.id;

  try {
    const slot = await ParkingSlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ message: "Không tìm thấy chỗ đỗ." });
    } // Không cho phép sửa nếu đang có xe

    if (slot.status === "occupied") {
      return res
        .status(400)
        .json({ message: "Không thể sửa ô đang có xe đỗ." });
    } // 1. Lấy vehicleType mới dựa trên area mới

    const { vehicleType } = getSlotDetailsFromArea(area); // 2. Cập nhật các trường

    slot.area = area;
    slot.vehicleType = vehicleType;
    slot.notes = notes || ""; // Cập nhật ghi chú (hoặc xóa nếu là chuỗi rỗng) // 3. Lưu (Lưu ý: Tên (name) không thay đổi)

    const updatedSlot = await slot.save();
    res.status(200).json(updatedSlot);
  } catch (error) {
    console.error("❌ LỖI TRONG UPDATE SLOT:", error);
    if (error.message === "Khu vực không hợp lệ.") {
      return res.status(400).json({ message: "Khu vực không hợp lệ." });
    }
    res.status(500).json({ message: "Lỗi Server Nội Bộ." });
  }
};

/**
 * @desc  (Admin) Xóa một chỗ đỗ
 * @route  DELETE /api/parking/:id
 * @access Private (Admin)
 */
export const deleteSlot = async (req, res) => {
  const slotId = req.params.id;

  try {
    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Không tìm thấy chỗ đỗ." });
    } // Không cho phép xóa nếu đang có xe

    if (slot.status === "occupied") {
      return res.status(400).json({
        message: "Không thể xóa chỗ đỗ đang có xe. Vui lòng chờ xe check-out.",
      });
    }

    await ParkingSlot.findByIdAndDelete(slotId);

    res.status(200).json({ message: "Xóa chỗ đỗ thành công." });
  } catch (error) {
    console.error("❌ LỖI TRONG DELETE SLOT:", error);
    res.status(500).json({ message: "Lỗi Server Nội Bộ." });
  }
};

/**
 * @desc  (User) Lấy Sơ đồ Bãi đỗ xe (Read-only)
 * @route  GET /api/parking/map
 * @access Private (User)
 */
export const getParkingMap = async (req, res) => {
  try {
    // Logic y hệt như getAllSlots (lấy tất cả và populate)
    const slots = await ParkingSlot.find({})
      .populate({
        path: "currentLog",
        select: "licensePlate user checkInTime",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ name: 1 });

    res.status(200).json(slots);
  } catch (error) {
    console.error("❌ LỖI TRONG GET PARKING MAP:", error);
    res.status(500).json({ message: "Lỗi Server Nội Bộ." });
  }
};

/**
 * @desc    (Admin) Lấy các chỉ số tổng quan (Metrics)
 * @route   GET /api/admin/parking/metrics
 * @access  Private (Admin)
 */
export const getMetrics = async (req, res) => {
  try {
    // 1. Tổng số Slots
    const totalSlots = await ParkingSlot.countDocuments();

    // 2. Số Slots đang được sử dụng (occupied + booked)
    const occupiedSlots = await ParkingSlot.countDocuments({
      status: { $in: ["occupied", "booked"] },
    });

    // 3. Số Slots đang bảo trì
    const maintenanceSlots = await ParkingSlot.countDocuments({
      status: "maintenance",
    });

    // 4. Số Slots khả dụng
    const availableSlots = await ParkingSlot.countDocuments({
      status: "available",
    });

    res.status(200).json({
      totalSlots,
      occupiedSlots,
      maintenanceSlots,
      availableSlots,
    });
  } catch (error) {
    console.error("❌ LỖI TRONG GET METRICS:", error);
    res.status(500).json({ message: "Lỗi Server Nội Bộ." });
  }
};

// @desc    Lấy danh sách TẤT CẢ log xe (Admin View)
// @route   GET /api/admin/logs/all
export const getAllVehicleLogs = async (req, res) => {
  try {
    // Lấy tất cả log, sắp xếp theo thời gian check-in mới nhất
    const logs = await VehicleLog.find({})
      .populate("parkingSlot", "name") // Lấy tên chỗ đỗ
      .populate("user", "name email role") // Lấy thông tin người đỗ
      .sort({ checkInTime: -1 })
      .lean();

    res.json(logs);
  } catch (error) {
    console.error("❌ LỖI KHI LẤY TẤT CẢ LOG:", error);
    res.status(500).json({ message: "Lỗi server khi tải log xe." });
  }
};
