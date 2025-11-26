import React from "react";
import { useNavigate } from "react-router-dom";
// Đảm bảo đường dẫn này đúng với cấu trúc dự án của bạn
import { useAuth } from "@/context/AuthContext";

// ==========================================
// 1. ICON COMPONENTS (SVG)
// ==========================================

const MotorbikeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="18.5" cy="17.5" r="3.5" />
    <path d="M15 6h-5a1 1 0 0 0-1 1v3.15a10.8 10.8 0 0 0-1.83 1.47l-1.67 1.68a2 2 0 0 0 .24 3l1.06.82a2 2 0 0 0 2.2-.4l1.56-1.56a2.5 2.5 0 0 1 1.77-.73h2.78a5 5 0 0 1 4.5 3.5" />
    <path d="M10.5 11.5 12 15" />
    <path d="m8 8 2-2 2 2" />
  </svg>
);

const CarIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const BicycleIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="18.5" cy="17.5" r="3.5" />
    <path d="M15 6h-5a1 1 0 0 0-1 1v3.15a10.8 10.8 0 0 0-1.83 1.47l-1.67 1.68a2 2 0 0 0 .24 3l1.06.82a2 2 0 0 0 2.2-.4l1.56-1.56a2.5 2.5 0 0 1 1.77-.73h2.78" />
    <path d="m12 17.5 3-3 3 3" />
    <path d="M12 17.5V6" />
  </svg>
);

const ArrowLeftIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

// ==========================================
// 2. CONSTANTS
// ==========================================

const VEHICLES = [
  {
    id: "motorbike",
    label: "Xe máy",
    icon: <MotorbikeIcon className="w-12 h-12" />,
  },
  {
    id: "car",
    label: "Ô tô",
    icon: <CarIcon className="w-12 h-12" />,
  },
  {
    id: "bicycle",
    label: "Xe đạp",
    icon: <BicycleIcon className="w-12 h-12" />,
  },
];

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

function VehicleSelectionPage() {
  const { selectVehicleType } = useAuth();
  const navigate = useNavigate();

  const handleSelectVehicle = (vehicleType) => {
    // Lưu ý: Đảm bảo Backend của bạn chấp nhận chuỗi "Motorbike" (viết hoa)
    // Nếu backend dùng chữ thường ("motorbike"), hãy bỏ dòng format bên dưới.
    const formatType =
      vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1);

    console.log("Selected Vehicle:", formatType); // Log để debug
    selectVehicleType(formatType);
    navigate("/dashboard");
  };

  // Hỗ trợ điều hướng bằng bàn phím (Enter)
  const handleKeyDown = (e, vehicleId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelectVehicle(vehicleId);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 px-4 font-sans">
      {/* --- HEADER --- */}
      <div className="text-center mb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 uppercase tracking-wider">
          Chọng phương tiện bạn muốn gửi
        </h1>
        <div className="h-1.5 w-12 bg-fuchsia-500 rounded-full mx-auto mt-3"></div>
      </div>

      {/* --- GRID CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-16 ">
        {VEHICLES.map((vehicle) => (
          <div
            key={vehicle.id}
            onClick={() => handleSelectVehicle(vehicle.id)}
            onKeyDown={(e) => handleKeyDown(e, vehicle.id)}
            // Accessibility props
            role="button"
            tabIndex={0}
            aria-label={`Chọn ${vehicle.label}`}
            // Styling
            className="group relative flex flex-col items-center justify-center aspect-square rounded-[2rem] bg-white border border-gray-200 shadow-xl cursor-pointer transition-all duration-300 outline-none focus:ring-4 focus:ring-fuchsia-300 hover:scale-105 hover:shadow-fuchsia-200 hover:border-fuchsia-300 hover:bg-gradient-to-br hover:from-fuchsia-500 over:to-yellow-6h00"
          >
            {/* Icon Box */}
            <div className="mb-6 text-yellow-400 transition-colors duration-300 group-hover:text-black">
              {React.cloneElement(vehicle.icon, {
                className:
                  "w-20 h-20 transition-transform duration-300 group-hover:-translate-y-2",
              })}
            </div>

            {/* Label */}
            <span className="text-xl font-bold text-slate-600 transition-colors duration-300 group-hover:text-white">
              {vehicle.label}
            </span>

            {/* Gạch chân trang trí (hiện khi hover) */}
            <div className="absolute bottom-12 w-10 h-1.5 bg-white/40 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 scale-x-0 group-hover:scale-x-100"></div>
          </div>
        ))}
      </div>

      {/* --- FOOTER BACK BUTTON --- */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          aria-label="Quay lại"
          className="w-12 h-12 flex items-center justify-center rounded-full bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-200 transition-transform hover:scale-110 hover:bg-fuchsia-600 focus:outline-none focus:ring-4 focus:ring-fuchsia-300"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default VehicleSelectionPage;
