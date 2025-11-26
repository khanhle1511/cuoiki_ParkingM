// BỔ SUNG: Import hook để lấy log đang hoạt động
import useActiveParkingSession from "../../../hooks/useActiveParkingSession";
// Lấy component từ thư mục components cùng cấp với WelcomePage.jsx (cần đi lùi 1 cấp)
import PastelHeader from "./components/PastelHeader.jsx";
import FindParkinglotBlock from "./components/FindParkinglotBlock.jsx";
import AvailableParkinglotsBlock from "./components/AvailableParkinglotsBlock.jsx";
import PromotionBlock from "./components/PromotionBlock.jsx";
import TopUserBlock from "./components/TopUserBlock.jsx";
import CommitInfoBlock from "./components/CommitInfoBlock.jsx";
import FooterBlock from "./components/FooterBlock.jsx";
const WelcomePage = () => {
  // 1. LẤY TRẠNG THÁI ACTIVE LOG
  // Giả định hook trả về { activeLog, isLoading, refetch }
  const { activeLog, isLoading, refetch } = useActiveParkingSession();

  // 2. Hàm xử lý sau khi Check-out thành công (để làm mới trạng thái)
  const handleCheckoutSuccess = () => {
    refetch(); // Gọi lại hook để load lại dữ liệu (activeLog sẽ thành null)
  };

  return (
    <div className="min-h-screen bg-white">
      <PastelHeader />

      {/* 🎯 LOGIC ĐIỀU KIỆN HIỂN THỊ */}
      {isLoading ? (
        // Hiển thị trạng thái tải
        <div className="container py-8 text-center">
          Đang kiểm tra trạng thái đỗ xe...
        </div>
      ) : activeLog ? (
        // A. HIỂN THỊ: THANH TRẠNG THÁI ĐANG ĐỖ
        <div className="container pt-8 pb-12">
          <h2 className="text-2xl font-bold mb-6">Trạng thái đỗ xe hiện tại</h2>
          {/* ActiveParkingSession phải được truyền prop activeLog và hàm onCheckoutSuccess */}
          <ActiveParkingSession
            activeLog={activeLog}
            onCheckoutSuccess={handleCheckoutSuccess}
          />
        </div>
      ) : (
        // B. HIỂN THỊ: SƠ ĐỒ BÃI ĐỖ XE (nếu không có activeLog)
        <>
          {/* Khối tìm chỗ đỗ xe (Chính là sơ đồ) */}
          <FindParkinglotBlock />
          <PromotionBlock />
          <AvailableParkinglotsBlock />
          <TopUserBlock />
          <CommitInfoBlock />
        </>
      )}

      {/* Footer (Luôn hiển thị) */}
      <FooterBlock />
    </div>
  );
};

export default WelcomePage;
