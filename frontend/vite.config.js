import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Cấu hình server proxy
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Bất kỳ yêu cầu nào bắt đầu bằng '/api'
      // sẽ được chuyển tiếp đến 'http://localhost:5000'
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true, // Cần thiết cho virtual hosts
        secure: false, // Không yêu cầu HTTPS
      },
    },
  },
});
