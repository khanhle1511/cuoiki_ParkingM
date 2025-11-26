import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// Import đường dẫn tương đối để tránh lỗi alias
import { useAuth } from "../../context/AuthContext.jsx";
import { cn } from "@/lib/utils";
import {
  Users,
  Clock,
  Crown,
  CalendarDays,
  Zap,
  Car,
  Bike,
  ArrowRight,
} from "lucide-react";

// --- SHADCN COMPONENTS ---
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

// --- COMPONENTS CON ---
import ModernProjectCard from "../../components/ui/ModernProjectCard";
import FullParkingMap from "../../components/dashboard/FullParkingMap.jsx";
import ParkingModule from "../../components/dashboard/ParkingModule.jsx";
import ActiveParkingSession from "./hooks/ActiveParkingSession";

// --- HELPERS ---
const formatCurrency = (amount) =>
  amount
    ? amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    : "Liên hệ";
const VEHICLE_TYPES = ["Car", "Motorbike", "Bicycle"];

const VehicleIcons = {
  Car: "🚗",
  Motorbike: "🏍️",
  Bicycle: "🚲",
};

const VehicleCardColors = {
  Car: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  Motorbike: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  Bicycle: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
  },
};

function HomeDashboardContent() {
  const {
    user,
    activeLog,
    loading,
    vehicleTypeToPark,
    pricingData,
    loadingPricing,
  } = useAuth();

  const navigate = useNavigate();
  const currentFilterType = vehicleTypeToPark;

  // --- STATE ---
  const [metrics, setMetrics] = useState({
    totalSlots: 0,
    occupiedSlots: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // 🔥 STATE: Gói dịch vụ của tôi
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  // Group data helper
  const groupedData = (() => {
    const grouped = { Hourly: { Car: null, Motorbike: null, Bicycle: null } };
    pricingData.forEach((item) => {
      if (item.rateType === "Hourly") {
        grouped.Hourly[item.vehicleType] = item;
      }
    });
    return grouped;
  })();

  // Fetch metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoadingMetrics(true);
      try {
        const res = await axios.get("/api/parking/metrics");
        setMetrics(res.data);
      } catch (err) {
        console.error("Lỗi lấy metrics:", err);
        setMetrics({ totalSlots: 25, occupiedSlots: 0 });
      } finally {
        setLoadingMetrics(false);
      }
    };

    if (user) {
      fetchMetrics();
    }
  }, [user, activeLog]);

  // 🔥 FETCH GÓI DỊCH VỤ CỦA TÔI
  useEffect(() => {
    const fetchMySubscriptions = async () => {
      if (!user || user.role !== "User") {
        setLoadingSubs(false);
        return;
      }

      setLoadingSubs(true);
      try {
        const res = await axios.get("/api/subscriptions/mine");
        // Chỉ lấy gói đang Active hoặc Pending
        const activeSubs = res.data.filter(
          (sub) => sub.status === "Active" || sub.status === "Pending"
        );
        setMySubscriptions(activeSubs);
      } catch (err) {
        console.error("Lỗi lấy gói dịch vụ:", err);
      } finally {
        setLoadingSubs(false);
      }
    };

    fetchMySubscriptions();
  }, [user]);

  const handleCheckoutSuccess = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (loading || user?.role !== "User") return;
    if (!activeLog && !vehicleTypeToPark) {
      navigate("/select-vehicle", { replace: true });
    }
  }, [loading, user, activeLog, vehicleTypeToPark, navigate]);

  if (loading || loadingMetrics || loadingPricing)
    return (
      <div className="p-8">
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  if (!user) return null;

  const pricingError =
    !loadingPricing && pricingData.length === 0
      ? "Không thể tải dữ liệu giá theo giờ."
      : null;

  const totalSlots = metrics.totalSlots;
  const occupiedSlots = metrics.occupiedSlots;
  const occupancyRate = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

  let mainContent;

  if (user.role === "User" && activeLog) {
    mainContent = (
      <ActiveParkingSession
        activeLog={activeLog}
        onCheckoutSuccess={handleCheckoutSuccess}
      />
    );
  } else if (user.role === "User" && !activeLog && currentFilterType) {
    mainContent = (
      <Card className="overflow-hidden border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">Sơ đồ bãi xe</CardTitle>
          <CardDescription>
            Chọn vị trí đỗ xe phù hợp với loại xe {currentFilterType}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <FullParkingMap filterVehicleType={currentFilterType} />
        </CardContent>
      </Card>
    );
  } else if (user.role === "Admin") {
    mainContent = <ParkingModule />;
  } else {
    mainContent = (
      <div className="text-center py-10 text-muted-foreground">
        Đang tải tài nguyên...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* === BANNER CHÀO MỪNG === */}
      <Card className="relative overflow-hidden p-6 md:p-8 border-none bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Chào, {user?.name}!
            </h1>
            <p className="mt-2 text-indigo-100/90 max-w-lg">
              {user.role === "Admin"
                ? "Hệ thống quản lý bãi đỗ xe đang hoạt động ổn định."
                : "Chúc bạn có trải nghiệm gửi xe an toàn và tiện lợi."}
            </p>
          </div>
          <div className="hidden md:block">
            <Crown className="w-24 h-24 text-white/20" />
          </div>
        </div>
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-white/10 blur-xl"></div>
      </Card>

      {/* 🔥 KHỐI GÓI DỊCH VỤ (ĐÃ SỬA LOGIC HIỂN THỊ) */}
      {user.role === "User" && !loadingSubs && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Tiêu đề + Nút xem tất cả */}
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-lg font-semibold tracking-tight text-gray-700 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              Gói dịch vụ ưu đãi
            </h2>

            <Button
              variant="link"
              onClick={() => navigate("/subscription")}
              className="text-indigo-600 h-auto p-0 hover:text-indigo-800 text-sm font-medium flex items-center"
            >
              Quản lý gói <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Nội dung Khối */}
          {mySubscriptions.length > 0 ? (
            // TRƯỜNG HỢP 1: ĐÃ CÓ GÓI -> Hiển thị danh sách
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mySubscriptions.map((sub) => {
                const isExpiringSoon =
                  new Date(sub.endDate) - new Date() < 7 * 24 * 60 * 60 * 1000;
                const vehicleIcon =
                  sub.pricing?.vehicleType === "Car" ? (
                    <Car />
                  ) : sub.pricing?.vehicleType === "Motorbike" ? (
                    <Zap />
                  ) : (
                    <Bike />
                  );

                return (
                  <Card
                    key={sub._id}
                    className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-amber-50 to-white"
                  >
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-white rounded-full shadow-sm text-amber-600">
                            {vehicleIcon}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">
                              {sub.pricing?.name}
                            </h3>
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-700 hover:bg-green-200 border-0"
                            >
                              Đang hoạt động
                            </Badge>
                          </div>
                        </div>
                        {isExpiringSoon && (
                          <Badge
                            variant="destructive"
                            className="animate-pulse"
                          >
                            Sắp hết hạn
                          </Badge>
                        )}
                      </div>

                      <div className="mt-4 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          <span>
                            Hết hạn:{" "}
                            <strong>
                              {new Date(sub.endDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>
                            Còn lại:{" "}
                            <strong>
                              {Math.ceil(
                                (new Date(sub.endDate) - new Date()) /
                                  (1000 * 60 * 60 * 24)
                              )}{" "}
                              ngày
                            </strong>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            // TRƯỜNG HỢP 2: CHƯA CÓ GÓI -> Hiển thị Banner Kêu gọi hành động (CTA)
            <Card className="border-dashed border-2 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="p-3 bg-white rounded-full shadow-sm text-amber-500 ring-4 ring-amber-100">
                    <Crown className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      Nâng cấp thành viên VIP ngay hôm nay!
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mt-1">
                      Đăng ký gói tháng để tiết kiệm chi phí đỗ xe lên đến 40%
                      và tận hưởng các ưu đãi độc quyền.
                    </p>
                  </div>
                </div>

                {/* 🚀 NÚT 2: Xem các gói ưu đãi -> Điều hướng tới /subscription */}
                <Button
                  onClick={() => navigate("/subscription")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 shrink-0 px-6 font-semibold"
                >
                  Xem các gói ưu đãi <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ... (Các phần Pricing, Metrics, Main Content giữ nguyên) ... */}
      {/* === PRICING CARDS === */}
      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-gray-700">
          Giá theo giờ
        </h2>
        {pricingError ? (
          <div className="p-4 text-red-700 bg-red-100 border border-red-200 rounded-md">
            {pricingError}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VEHICLE_TYPES.map((type) => {
              const item = groupedData.Hourly[type];
              const name =
                type === "Car"
                  ? "Ô Tô"
                  : type === "Motorbike"
                  ? "Xe Máy"
                  : "Xe Đạp";
              const colors = VehicleCardColors[type] || {
                bg: "bg-gray-50",
                text: "text-gray-700",
                border: "border-gray-200",
              };

              return (
                <Card
                  key={type}
                  className={cn(
                    "transition-all hover:shadow-lg",
                    colors.bg,
                    colors.border
                  )}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle
                      className={cn("text-sm font-medium", colors.text)}
                    >
                      {name}
                    </CardTitle>
                    <div className={cn("text-2xl", colors.text)}>
                      {VehicleIcons[type]}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {item ? (
                      <>
                        <div className={cn("text-3xl font-bold", colors.text)}>
                          {formatCurrency(item.rate)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          / giờ
                        </p>
                      </>
                    ) : (
                      <div className="text-xl font-bold text-muted-foreground">
                        N/A
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* === METRICS === */}
      <div className="mt-4">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-gray-700">
          Tổng quan Bãi đỗ xe
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <ModernProjectCard
            title="Tỉ lệ sử dụng"
            targetTeam="Toàn bộ khu vực"
            timeLeft={`${occupiedSlots}/${totalSlots} Slots Đã dùng`}
            icon={<Users />}
            iconBgColor="bg-indigo-600"
            progressPercent={`${Math.round(occupancyRate)}%`}
          />
        </div>
      </div>

      {/* === MAIN CONTENT AREA === */}
      <div className="mt-2">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-gray-700">
          {activeLog ? "Trạng thái đỗ xe hiện tại" : "Quản lý khu vực đỗ xe"}
        </h2>
        {mainContent}
      </div>
    </div>
  );
}

export default HomeDashboardContent;
