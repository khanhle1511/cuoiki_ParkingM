import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import axios from "axios";

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider Component
const AuthProvider = ({ children }) => {
  // === State Xác thực ===
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);

  // === State Giá (MỚI) ===
  const [pricingData, setPricingData] = useState([]);
  const [loadingPricing, setLoadingPricing] = useState(true);

  // === State Bãi đỗ xe ===
  const [vehicleTypeState, setVehicleTypeState] = useState(
    () => sessionStorage.getItem("vehicleTypeToPark") || null
  );
  const [activeLog, setActiveLog] = useState(null);

  // Hàm tiện ích: Cập nhật loại xe và sessionStorage
  const updateVehicleTypeToPark = (vehicleType) => {
    if (vehicleType) {
      sessionStorage.setItem("vehicleTypeToPark", vehicleType);
      setVehicleTypeState(vehicleType);
    } else {
      sessionStorage.removeItem("vehicleTypeToPark");
      setVehicleTypeState(null);
    }
  };

  // 1. (GET /api/vehicle/active) Lấy log đang hoạt động
  const fetchActiveLog = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem("authToken");
      if (currentToken && !axios.defaults.headers.common["Authorization"]) {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${currentToken}`;
      }

      const res = await axios.get("/api/logs/active");
      if (res.data) {
        setActiveLog(res.data);
        return res.data;
      } else {
        setActiveLog(null);
        return null;
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Lỗi khi fetchActiveLog:", error.response?.data?.message);
      }
      setActiveLog(null);
      return null;
    }
  }, []);

  // 🔥 HÀM MỚI: FETCH DỮ LIỆU GIÁ (Có thể gọi lại từ Admin Portal) 🔥
  const fetchPricing = useCallback(async () => {
    setLoadingPricing(true);
    try {
      const res = await axios.get("/api/pricing");
      setPricingData(res.data);
      return res.data;
    } catch (err) {
      console.error("Lỗi khi tải bảng giá:", err);
      // Cần setPricingData nếu lỗi để tránh lỗi render
      setPricingData([]);
    } finally {
      setLoadingPricing(false);
    }
  }, []);

  // === HÀM XỬ LÝ NGHIỆP VỤ ĐỖ XE (FIXED) ===

  // 2. (POST /api/vehicle/check-in/:slotId) Gửi xe
  const checkIn = async (slotId, vehiclePlate, note) => {
    try {
      // ĐƯỜNG DẪN ĐÃ ĐƯỢC SỬA VÀ ĐANG CHÍNH XÁC
      const res = await axios.post(`/api/logs/check-in`, {
        parkingSlotId: slotId,
        licensePlate: vehiclePlate,
        notes: note,
        vehicleType: vehicleTypeState, // Gửi loại xe đang chọn
      });
      const newActiveLog = res.data.log;
      setActiveLog(newActiveLog);
      updateVehicleTypeToPark(null);
      return { success: true, data: newActiveLog }; // Trả về Log đã cập nhật
    } catch (error) {
      throw error;
    }
  };

  // 3. (PUT /api/vehicle/check-out/:logId) Lấy xe ra
  const checkOut = async (billData) => {
    // 1. Thêm đoạn này để chặn lỗi undefined
    if (!billData || !billData.logId) {
      console.error("❌ Lỗi checkOut: Thiếu dữ liệu billData!", billData);
      return; // Dừng ngay, không chạy tiếp để tránh crash
    }

    try {
      // 2. Gọi API như bình thường
      const response = await axios.post("/api/vehicle/checkout", {
        logId: billData.logId,
        checkoutTime: billData.checkoutTime,
        totalAmount: billData.totalAmount,
      });

      // Dispatch update state...
      return response.data;
    } catch (error) {
      console.error("Lỗi API Checkout:", error);
      throw error;
    }
  };
  // 4. User chọn 1 loại xe (ở VehicleSelectionPage)
  const selectVehicleType = (vehicleType) => {
    updateVehicleTypeToPark(vehicleType);
  };

  // 5. User muốn chọn lại xe (ở ParkingGrid)
  const resetVehicleType = () => {
    updateVehicleTypeToPark(null);
  };

  // === HÀM XỬ LÝ XÁC THỰC (AUTH) ===

  // 6. Đăng ký (Register)
  const registerUser = async (registrationData) => {
    try {
      const res = await axios.post("/api/auth/register", registrationData);
      return { success: true, data: res.data };
    } catch (error) {
      throw error;
    }
  };

  // 7. Đăng nhập (Login)
  const login = async (username, password) => {
    const res = await axios.post("/api/auth/login", { username, password });
    const { token, isParking, activeLog, ...userData } = res.data;

    localStorage.setItem("authToken", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
    setToken(token);

    if (userData.role === "User") {
      setActiveLog(activeLog);
    }
    return { success: true, user: userData, isParking: isParking };
  };

  // 8. Đăng xuất (Logout)
  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
    axios.defaults.headers.common["Authorization"] = null;

    // Dọn dẹp state bãi đỗ xe khi logout
    setActiveLog(null);
    updateVehicleTypeToPark(null);

    // Dọn dẹp sessionStorage của Auth
    sessionStorage.removeItem("currentPage");
    sessionStorage.removeItem("currentEmail");
    sessionStorage.removeItem("resetToken");
  };

  // === EFFECT (Chạy khi tải app) ===
  useEffect(() => {
    const initializeApp = async () => {
      if (token) {
        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const userRes = await axios.get("/api/auth/profile");
          setUser(userRes.data);

          // 3. 🔥 QUAN TRỌNG: Nếu là User thường, LUÔN kiểm tra trạng thái đỗ xe
          if (userRes.data.role === "User") {
            console.log("F5 Detected: Checking active parking session...");
            await fetchActiveLog();
          }
        } catch (error) {
          console.error("Lỗi khi khởi tạo (Token hỏng?):", error.message);
          logout();
        }
      }
      // 🔥 GỌI HÀM TẢI GIÁ KHI KHỞI TẠO 🔥
      await fetchPricing();
      setLoading(false);
    };

    initializeApp();
  }, [token, fetchActiveLog, fetchPricing]);
  // ======================================== ===

  // Cung cấp các state và hàm cho toàn bộ ứng dụng
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,

        // Dữ liệu giá MỚI
        pricingData,
        loadingPricing,
        fetchPricing, // Hàm để Admin gọi lại khi update

        activeLog,
        vehicleTypeToPark: vehicleTypeState,

        login,
        logout,
        register: registerUser,
        fetchActiveLog,
        checkIn,
        checkOut,
        selectVehicleType,
        resetVehicleType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom Hook để sử dụng Context
export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
