import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
/**
 * Hook tùy chỉnh để lấy Phiên đỗ xe đang hoạt động của người dùng.
 * @returns {object} { activeLog, isLoading, refetch }
 */
const useActiveParkingSession = () => {

  const [activeLog, setActiveLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Hàm fetch dữ liệu: Sử dụng useCallback để hàm không bị tạo lại không cần thiết
  const fetchActiveLog = useCallback(async () => {
    setIsLoading(true);
    try {
      // Gọi API Backend đã định nghĩa trong vehicleLogController.js
      const response = await axios.get("/api/logs/active");

      // Backend trả về `null` nếu không tìm thấy log đang hoạt động (200 OK)
      // hoặc trả về đối tượng log nếu có.
      // Dù API trả về null (body rỗng) hay activeLog, ta đều lưu lại.
      setActiveLog(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy Active Parking Log:", error);
      // Nếu có lỗi, đặt log thành null
      setActiveLog(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Tự động fetch khi component mount
  useEffect(() => {
    fetchActiveLog();

    // 🚀 BỔ SUNG: Tự động refresh sau mỗi khoảng thời gian (ví dụ 30 giây)
    // để cập nhật thời gian đỗ xe cho người dùng (optional)
    const intervalId = setInterval(fetchActiveLog, 30000);

    // Dọn dẹp (cleanup) khi component unmount
    return () => clearInterval(intervalId);
  }, [fetchActiveLog]);

  // 3. Trả về trạng thái và hàm làm mới (refetch)
  return { activeLog, isLoading, refetch: fetchActiveLog };
};

export default useActiveParkingSession;
