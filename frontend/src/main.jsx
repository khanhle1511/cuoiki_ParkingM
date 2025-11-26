import React from "react";
import ReactDOM from "react-dom/client";
// SỬA LỖI: Xóa đuôi .jsx khỏi App
import App from "./App";
// SỬA LỖI: Đảm bảo file index.css (chứa Tailwind) được import ở đây
import "./index.css";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </React.StrictMode>
);
