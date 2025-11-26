import React from "react";
import { Shield, DollarSign, Clock, CheckCircle } from "lucide-react";

const CommitInfoBlock = () => {
  const commitments = [
    {
      name: "AN TOÀN",
      icon: Shield,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      name: "MINH BẠCH",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      name: "HỖ TRỢ",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      name: "CHÍNH XÁC",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-700">
        CAM KẾT TỪ HỆ THỐNG
      </h2>
      <p className="text-center mb-10 text-gray-500 max-w-2xl mx-auto">
        Cam kết cung cấp thông tin chỗ đỗ xe chính xác, theo thời gian thực và
        trải nghiệm đỗ xe an toàn, nhanh chóng.
      </p>

      <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        {commitments.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            {/* Icon giả lập */}
            <div
              className={`w-20 h-20 rounded-full mb-3 flex items-center justify-center shadow-lg ${item.bgColor}`}
            >
              <item.icon size={40} className={item.color} />
            </div>
            <p className={`font-semibold text-lg ${item.color}`}>{item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CommitInfoBlock;
