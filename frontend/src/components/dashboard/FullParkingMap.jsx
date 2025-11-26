import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useAuth } from "/src/context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// --- SHADCN COMPONENTS ---
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- ICONS ---
import {
  Search,
  Lock,
  Bike,
  Car,
  Zap,
  CheckCircle2,
  Clock,
  MapPin,
  Info,
  Key,
  FileText,
} from "lucide-react";

// --- COMPONENT ADMIN MODAL ---
import SlotAdminModal from "../admin/SlotAdminModal";

// =================================================================
// === 1. CẤU HÌNH GIAO DIỆN ===
// (Định nghĩa ở ngoài component chính)
// =================================================================
const ZONE_STYLES = {
  car: {
    label: "Khu vực Ô tô",
    icon: <Car className="h-5 w-5" />,
    bgIcon: (
      <Car className="h-16 w-16 opacity-[0.07] absolute -bottom-2 -right-2 -rotate-12" />
    ),
    color: "text-blue-600",
    fillColor: "bg-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  motorbike: {
    label: "Khu vực Xe máy",
    icon: <Zap className="h-5 w-5" />,
    bgIcon: (
      <Zap className="h-16 w-16 opacity-[0.07] absolute -bottom-2 -right-2 -rotate-12" />
    ),
    color: "text-green-600",
    fillColor: "bg-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  bicycle: {
    label: "Khu vực Xe đạp",
    icon: <Bike className="h-5 w-5" />,
    bgIcon: (
      <Bike className="h-16 w-16 opacity-[0.07] absolute -bottom-2 -right-2 -rotate-12" />
    ),
    color: "text-purple-600",
    fillColor: "bg-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  default: {
    label: "Khu vực Khác",
    icon: <MapPin className="h-5 w-5" />,
    color: "text-slate-600",
    fillColor: "bg-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
  },
};

// =================================================================
// === 2. COMPONENT CON: SLOT ITEM ===
// (Định nghĩa ở ngoài component chính để fix lỗi gạch chân đỏ)
// =================================================================
function MapSlotItem({ slot, onClick, isAdmin, user }) {
  const currentUserId = user?._id;

  const isAvailable = slot.status === "available";
  const isBooked = slot.status === "booked";
  const isOccupied = slot.status === "occupied";
  const isMaintenance = slot.status === "maintenance";

  const zoneStyle =
    ZONE_STYLES[slot.vehicleType?.toLowerCase()] || ZONE_STYLES.default;

  let containerClass =
    "relative flex flex-col justify-between h-28 rounded-xl border transition-all duration-300 p-3 overflow-hidden group select-none";
  let statusBadge = null;
  let statusDotColor = "bg-gray-300";

  if (isAvailable) {
    containerClass += ` bg-white ${zoneStyle.borderColor} hover:border-current hover:shadow-lg hover:-translate-y-1 cursor-pointer hover:${zoneStyle.color}`;
    statusBadge = (
      <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded-full w-fit">
        Trống
      </span>
    );
    statusDotColor = "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]";
  } else if (isBooked) {
    containerClass +=
      " bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 cursor-pointer shadow-sm";
    const isMyBooking = slot.currentBookingUser?._id === currentUserId;
    statusBadge = (
      <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-700 bg-yellow-200/50 px-2 py-1 rounded-full w-fit">
        <Clock className="h-3 w-3" /> {isMyBooking ? "Bạn đặt" : "Đã đặt"}
      </div>
    );
    statusDotColor = "bg-yellow-500";
  } else if (isOccupied) {
    containerClass += " bg-slate-100 border-slate-300 cursor-pointer";
    statusBadge = (
      <div className="flex items-center gap-1 text-[10px] font-bold text-white bg-slate-600 px-2 py-1 rounded-full w-fit shadow-sm">
        {slot.currentLog?.licensePlate || "Đang đỗ"}
      </div>
    );
    statusDotColor = "bg-red-500";
  } else if (isMaintenance) {
    containerClass +=
      " bg-gray-50 border-gray-200 opacity-60 border-dashed border-2";
    if (!isAdmin) containerClass += " cursor-not-allowed";
    else containerClass += " cursor-pointer hover:bg-gray-100";
    statusBadge = (
      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
        <Lock className="h-3 w-3" /> Bảo trì
      </span>
    );
    statusDotColor = "bg-gray-400";
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div onClick={() => onClick(slot)} className={containerClass}>
          {isAvailable && zoneStyle.bgIcon}
          <div className="flex justify-between items-start z-10">
            <span
              className={cn(
                "font-extrabold text-lg tracking-tight",
                isOccupied
                  ? "text-slate-700"
                  : isMaintenance
                  ? "text-slate-400"
                  : zoneStyle.color
              )}
            >
              {slot.name}
            </span>
            <div className={cn("h-2.5 w-2.5 rounded-full", statusDotColor)} />
          </div>
          <div className="z-10 mt-auto">{statusBadge}</div>
          {isOccupied && (
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              {React.cloneElement(zoneStyle.icon, {
                className: "h-14 w-14 text-slate-900",
              })}
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          Trạng thái:{" "}
          {isAvailable
            ? "Sẵn sàng"
            : isBooked
            ? "Đã đặt trước"
            : isOccupied
            ? "Đang có xe"
            : "Bảo trì"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

// =================================================================
// === 3. COMPONENT MODAL: CHECK-IN MODAL ===
// (Định nghĩa ở ngoài component chính để fix lỗi gạch chân đỏ)
// =================================================================
function CheckInModal({ slot, user, onClose, onConfirm, isLoading, error }) {
  // ✅ SỬA LỖI GẠCH CHÂN ĐỎ: Dùng Hook ở đầu
  const [plate, setPlate] = useState(""); // Biển số
  const [notes, setNotes] = useState(""); // Ghi chú

  const formatDateTime = (isoDate) => {
    if (!isoDate) return "N/A";
    return new Date(isoDate).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const modalOverlayClass =
    "fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4";
  const modalContentClass =
    "bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200 border border-slate-100";

  const handleConfirmClick = () => {
    if (!plate.trim()) return;
    onConfirm(plate.trim(), notes.trim());
  };

  const renderContent = () => {
    const isAvailable = slot.status === "available";
    const isBooked = slot.status === "booked";
    const isOccupied = slot.status === "occupied";
    const isMaintenance = slot.status === "maintenance";

    if (isAvailable) {
      return (
        <>
          <div className="flex flex-col items-center mb-4 text-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Key className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Gửi xe (Check-in)
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Điền thông tin để gửi xe vào ô{" "}
              <strong className="text-slate-800">{slot.name}</strong>
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Biển số xe <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ví dụ: 59-A1 12345"
                className="h-11 text-lg font-semibold text-center tracking-wide uppercase border-slate-300 focus-visible:ring-blue-500"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                <FileText className="h-3 w-3" /> Ghi chú (Tùy chọn)
              </label>
              <Textarea
                placeholder="Ví dụ: Xe trầy nhẹ bên phải..."
                className="resize-none text-sm border-slate-300 focus-visible:ring-blue-500"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="outline" onClick={onClose} className="h-11">
              Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirmClick}
              disabled={isLoading || !plate.trim()}
              className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-200"
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận Gửi"}
            </Button>
          </div>
        </>
      );
    }

    // --- Các trường hợp khác (Booked, Occupied, Maintenance) ---
    // (Đây là phần hiển thị thông tin khi click vào ô đã có xe...)
    let title = `Chi tiết Ô ${slot.name}`;
    let statusLabel = "";
    let statusColor = "";

    if (isBooked) {
      statusLabel = "ĐÃ ĐẶT TRƯỚC";
      statusColor = "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
    if (isOccupied) {
      statusLabel = "ĐANG CÓ XE";
      statusColor = "text-red-600 bg-red-50 border-red-200";
    }
    if (isMaintenance) {
      title = "Thông báo";
      statusLabel = "ĐANG BẢO TRÌ";
      statusColor = "text-gray-500 bg-gray-50 border-gray-200";
    }

    return (
      <>
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <Badge
            variant="outline"
            className={cn("border px-2 py-0.5", statusColor)}
          >
            {statusLabel}
          </Badge>
        </div>
        <div className="space-y-4 mb-6">
          {isBooked && (
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 text-sm">Người đặt</span>
              <span className="font-bold text-slate-800">
                {slot.currentBookingUser?._id === user?._id
                  ? "BẠN"
                  : slot.currentBookingUser?.name}
              </span>
            </div>
          )}
          {isOccupied && (
            <>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 text-sm">Biển số xe</span>
                <span className="font-bold text-lg text-slate-800">
                  {slot.currentLog?.licensePlate || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 text-sm">Giờ vào bãi</span>
                <span className="font-medium text-slate-800">
                  {formatDateTime(slot.currentLog?.checkInTime)}
                </span>
              </div>
            </>
          )}
          {isMaintenance && (
            <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
              <Lock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-slate-600 text-sm">
                Ô đỗ này đang được bảo trì và tạm thời không khả dụng.
              </p>
            </div>
          )}
        </div>
        <Button className="w-full" variant="outline" onClick={onClose}>
          Đóng
        </Button>
      </>
    );
  };

  return (
    <div className={modalOverlayClass} onClick={onClose}>
      <div className={modalContentClass} onClick={(e) => e.stopPropagation()}>
        {renderContent()}
      </div>
    </div>
  );
}

// =================================================================
// === 4. COMPONENT CHÍNH: FULL PARKING MAP ===
// =================================================================
function FullParkingMap({ filterVehicleType }) {
  // ✅ SỬA LỖI: Đưa Hook 'useAuth' lên đầu tiên
  const { user, fetchActiveLog } = useAuth();

  const navigate = useNavigate();

  // ✅ Bây giờ mới dùng 'user'
  const isAdmin = user?.role === "Admin" || user?.role === "Manager";

  // ... (Tất cả state, useEffect, filter, renderZone giữ nguyên)
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialFilter = (filterVehicleType || "all").toLowerCase();
  const [filter, setFilter] = useState(initialFilter);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    const lowerProp = (filterVehicleType || "all").toLowerCase();
    if (lowerProp !== filter) setFilter(lowerProp);
  }, [filterVehicleType]);

  const fetchAllSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/parking/map");
      setSlots(res.data);
    } catch (err) {
      setError("Không thể tải dữ liệu bãi đỗ.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSlots();
  }, [fetchAllSlots]);

  const filteredSlots = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    return slots.filter((slot) => {
      const vType = slot.vehicleType ? slot.vehicleType.toLowerCase() : "";
      const typeMatch = filter === "all" || vType === filter;
      if (!typeMatch) return false;
      if (lowerSearch === "") return true;
      if (slot.name.toLowerCase().includes(lowerSearch)) return true;
      if (isAdmin) {
        if (
          slot.status === "occupied" &&
          slot.currentLog?.licensePlate?.toLowerCase().includes(lowerSearch)
        )
          return true;
        if (
          slot.status === "booked" &&
          slot.currentBookingUser?.name.toLowerCase().includes(lowerSearch)
        )
          return true;
      }
      return false;
    });
  }, [slots, filter, searchTerm, isAdmin]);

  const renderZone = (typeKey, customTitle, areaFilter = null) => {
    const zoneSlots = filteredSlots.filter((s) => {
      const typeMatch = s.vehicleType?.toLowerCase() === typeKey;
      let areaMatch = true;
      if (typeof areaFilter === "function") {
        areaMatch = areaFilter(s);
      } else if (areaFilter) {
        areaMatch = s.area === areaFilter;
      }
      return typeMatch && areaMatch;
    });

    if (filter !== "all" && filter !== typeKey) return null;
    if (zoneSlots.length === 0) return null;

    const style = ZONE_STYLES[typeKey] || ZONE_STYLES.default;
    const title = customTitle || style.label;

    const total = zoneSlots.length;
    const occupiedCount = zoneSlots.filter(
      (s) => s.status === "occupied" || s.status === "booked"
    ).length;
    const occupancyRate = total > 0 ? (occupiedCount / total) * 100 : 0;

    return (
      <Card
        className={cn(
          "border-none shadow-sm overflow-hidden mb-8 transition-all hover:shadow-md",
          style.bgColor
        )}
      >
        <div
          className={cn(
            "px-6 py-4 border-b bg-white/60 backdrop-blur-sm",
            style.borderColor
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div
                className={cn("p-2 rounded-lg bg-white shadow-sm", style.color)}
              >
                {style.icon}
              </div>
              <div>
                <h3
                  className={cn(
                    "text-lg font-bold uppercase tracking-tight",
                    style.color
                  )}
                >
                  {title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Đang sử dụng:{" "}
                  <span className="font-bold text-slate-700">
                    {occupiedCount}
                  </span>{" "}
                  / {total}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-white text-slate-700 border shadow-sm w-fit"
            >
              {total} Vị trí
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Progress
              value={occupancyRate}
              className="h-2 bg-white flex-1"
              indicatorClassName={style.fillColor}
            />
            <span className="text-[10px] font-bold text-slate-400 min-w-[30px] text-right">
              {Math.round(occupancyRate)}%
            </span>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {zoneSlots.map((slot) => (
              <MapSlotItem
                key={slot._id}
                slot={slot}
                isAdmin={isAdmin}
                user={user}
                onClick={(s) => {
                  setSelectedSlot(s);
                  setModalError(null);
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleCloseModal = () => setSelectedSlot(null);

  const handleCheckIn = async (licensePlate, notes) => {
    if (!selectedSlot || selectedSlot.status !== "available") return;
    setModalLoading(true);
    setModalError(null);
    try {
      await axios.post(`/api/vehicle/check-in`, {
        parkingSlotId: selectedSlot._id,
        vehicleType: selectedSlot.vehicleType,
        licensePlate: licensePlate,
        notes: notes,
      });
      if (fetchActiveLog) await fetchActiveLog();

      setModalLoading(false);
      setSelectedSlot(null);
    } catch (err) {
      setModalError(err.response?.data?.message || "Lỗi khi gửi xe.");
      setModalLoading(false);
    }
  };

  if (!user)
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="w-full space-y-4">
      {/* KHỐI 1: TIÊU ĐỀ (TÍM) */}
      <div className="bg-purple-50/70 p-6 rounded-3xl border border-purple-100 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm text-purple-500 hidden sm:block">
          <Info className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-purple-900 tracking-tight">
            Sơ đồ bãi xe
          </h2>
          <p className="text-purple-700/80 mt-1 text-sm">
            quản lí bãi giữ xe dựa trến sơ đồ
          </p>
        </div>
      </div>

      {/* KHỐI 2: CÔNG CỤ (XANH) */}
      <div className="bg-blue-50/70 p-4 rounded-3xl border border-blue-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <Tabs
            value={filter}
            onValueChange={setFilter}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-white p-1 h-auto rounded-xl w-full md:w-auto grid grid-cols-4 md:flex shadow-sm border border-blue-100">
              <TabsTrigger
                value="all"
                className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 font-medium"
              >
                Tất cả
              </TabsTrigger>
              <TabsTrigger
                value="motorbike"
                className="rounded-lg px-4 py-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-800 font-medium"
              >
                Xe Máy
              </TabsTrigger>
              <TabsTrigger
                value="bicycle"
                className="rounded-lg px-4 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 font-medium"
              >
                Xe Đạp
              </TabsTrigger>
              <TabsTrigger
                value="car"
                className="rounded-lg px-4 py-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800 font-medium"
              >
                Ô Tô
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input
              placeholder={
                isAdmin ? "Tìm tên ô, biển số..." : "Tìm tên ô đỗ..."
              }
              className="pl-10 bg-white border-blue-100 rounded-xl focus-visible:ring-blue-400 shadow-sm h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* MAP */}
      <ScrollArea className="h-[calc(100vh-320px)] w-full rounded-xl pr-4 mt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-400">Đang tải bản đồ...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500 bg-red-50 rounded-xl">
            {error}
          </div>
        ) : (
          <div className="pb-20 pt-2">
            {renderZone("car", "Khu Ô Tô 1 (Cars)", "car-1")}
            {renderZone(
              "car",
              "Khu Ô Tô 2 (Cars)",
              (slot) => slot.area !== "car-1"
            )}
            {renderZone("motorbike", "Khu Xe Máy")}
            {renderZone("bicycle", "Khu Xe Đạp")}

            {filteredSlots.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                <div className="text-slate-300 mb-2">
                  <Search className="h-10 w-10 mx-auto" />
                </div>
                <p className="text-slate-500 text-lg font-medium">
                  Không tìm thấy ô đỗ phù hợp.
                </p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* MODALS */}
      {selectedSlot && isAdmin && (
        <SlotAdminModal
          slot={selectedSlot}
          onClose={handleCloseModal}
          onRefresh={() => {
            handleCloseModal();
            fetchAllSlots();
          }}
        />
      )}
      {selectedSlot && !isAdmin && (
        <CheckInModal
          slot={selectedSlot}
          user={user}
          onClose={handleCloseModal}
          onConfirm={handleCheckIn}
          isLoading={modalLoading}
          error={modalError}
        />
      )}
    </div>
  );
}

// 5. EXPORT
export default FullParkingMap;
