import React from "react";
import { Award, User, Clock } from "lucide-react";

const TopUserBlock = () => {
  return (
    <section className="py-16 bg-pink-50">
      <h2 className="text-2xl font-bold text-center mb-10 text-pink-800">
        PARKING APP - CHẤT LƯỢNG LÀ ƯU TIÊN
      </h2>
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        {/* Khối thống kê (Top Users) */}
        <div className="space-y-8 mb-8 md:mb-0 md:w-1/2">
          {/* Top 1 */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-pink-200 rounded-full flex-shrink-0 flex items-center justify-center">
              <Award size={30} className="text-pink-700" />
            </div>
            <div>
              <p className="text-xl font-bold text-pink-900">
                TOP 1: Nguyễn Văn A
              </p>
              <p className="text-sm text-pink-700">
                Người dùng đỗ xe nhiều nhất: 99 lần
              </p>
              <p className="text-sm text-pink-700 font-light">
                Ưu đãi: Giảm 50% phí đỗ xe tháng này
              </p>
            </div>
          </div>

          {/* Top 2 */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-pink-200 rounded-full flex-shrink-0 flex items-center justify-center">
              <User size={30} className="text-pink-700" />
            </div>
            <div>
              <p className="text-xl font-bold text-pink-900">
                TOP 2: Trần Thị B
              </p>
              <p className="text-sm text-pink-700">
                Thời gian đỗ xe tích lũy: 500 giờ
              </p>
              <p className="text-sm text-pink-700 font-light">
                Ưu đãi: Tặng 1 giờ đỗ xe miễn phí
              </p>
            </div>
          </div>

          {/* Top 3 */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-pink-200 rounded-full flex-shrink-0 flex items-center justify-center">
              <Clock size={30} className="text-pink-700" />
            </div>
            <div>
              <p className="text-xl font-bold text-pink-900">Hơn 6,500</p>
              <p className="text-sm text-pink-700">
                Chỗ đỗ xe được quản lý trên hệ thống
              </p>
              <p className="text-sm text-pink-700 font-light">
                Đảm bảo luôn có chỗ cho bạn!
              </p>
            </div>
          </div>
        </div>

        {/* Hình minh họa giả lập (tái tạo hình ảnh người ngồi) */}
        <div className="w-full md:w-1/3 h-64 bg-pink-100 rounded-xl border-4 border-pink-300 flex items-center justify-center mt-8 md:mt-0">
          <span className="text-pink-700">Hình ảnh Minh họa (Vẽ tay)</span>
        </div>
      </div>
    </section>
  );
};

export default TopUserBlock;
