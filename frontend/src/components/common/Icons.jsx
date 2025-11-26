import React from "react";

// === VEHICLE ICONS (Dùng cho VehicleSelectionPage) ===
// Dùng stroke (đường viền) cho vẻ ngoài hiện đại
export const MotorcycleIcon = ({ className = "w-10 h-10" }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="18.5" cy="17.5" r="3.5" />
    <path d="M12 17.5H6.5v-3H2.5L2 8h7l4 7" />
    <path d="M12 17.5h6.5v-3H21l.5-4h-7l-4 7z" />
  </svg>
);

export const CarIcon = ({ className = "w-10 h-10" }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 17H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2z" />
    <circle cx="7" cy="13" r="1" />
    <circle cx="17" cy="13" r="1" />
  </svg>
);

export const BicycleIcon = ({ className = "w-10 h-10" }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="19" r="3" />
    <path d="M17 17a3 3 0 0 0-3-3H6.5l-2.8-2.8c-1.3-1.3-1.3-3.4 0-4.7l.7-.7c1.3-1.3 3.4-1.3 4.7 0L10 6h4l2-2h3a2 2 0 0 1 2 2v7c0 1.7-1.3 3-3 3h-5" />
    <path d="M16 17H6a3 3 0 0 1-3-3V7.5L5.7 5.7c1.3-1.3 3.4-1.3 4.7 0L12 7.5V14" />
  </svg>
);

// === FORM ICONS (Dùng cho Register/Login/Forgot) ===

// Icon Người dùng (Dùng cho các trường User/Username)
export const UserIcon = ({
  className = "w-5 h-5",
  fill = "none",
  stroke = "currentColor",
}) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// Icon Khóa (Dùng cho các trường Password/Code)
export const LockIcon = ({
  className = "w-5 h-5",
  fill = "none",
  stroke = "currentColor",
}) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

// Icon Email (Dùng cho các trường Email)
export const EmailIcon = ({
  className = "w-5 h-5",
  fill = "none",
  stroke = "currentColor",
}) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);
