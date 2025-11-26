import React from "react";
import { Tag } from "lucide-react";
import { Card } from "@/components/ui/card.jsx";

const PromotionBlock = () => {
  const pastelColors = ["bg-pink-100", "bg-teal-100", "bg-blue-100"];

  return (
    <section className="py-12 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-10 text-green-700">
        KHUYẾN MÃI NỔI BẬT
      </h2>

      {/* Giả lập Carousel Spacing: Grid 3 cột */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <Card
              key={index}
              className={`h-56 ${
                pastelColors[index % 3]
              } rounded-xl shadow-lg border-b-4 border-gray-300 overflow-hidden relative p-6 flex flex-col justify-end`}
            >
              <div className="absolute inset-0 bg-opacity-30 flex items-center justify-center">
                <Tag
                  size={40}
                  className={`text-gray-800 drop-shadow-md opacity-30 absolute top-4 left-4`}
                />
              </div>

              <h3 className="text-xl font-extrabold text-gray-800 z-10 mb-2">
                Ưu Đãi Đặc Biệt {index + 1}
              </h3>
              <p className="text-sm text-gray-600 z-10">
                Giảm 10% cho lần đỗ xe đầu tiên trong tháng.
              </p>
            </Card>
          ))}
      </div>
    </section>
  );
};

export default PromotionBlock;
