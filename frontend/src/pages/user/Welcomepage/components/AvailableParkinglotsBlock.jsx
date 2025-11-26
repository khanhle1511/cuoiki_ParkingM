import React from "react";
// Giả định import các component UI
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx"; // Giả định Badge component
import { MapPin, Car, Bike, TrendingUp } from "lucide-react";

const AvailableParkinglotsBlock = () => {
  const lots = [
    {
      name: "Khu Đỗ Xe Q.1",
      type: "Ô tô đông nhất",
      slots: "10/50 trống",
      imageColor: "bg-indigo-300",
      icon: Car,
    },
    {
      name: "Khu Đỗ Xe Q.Bình Thạnh",
      type: "Xe máy đông nhất",
      slots: "5/120 trống",
      imageColor: "bg-cyan-300",
      icon: Bike,
    },
    {
      name: "Khu Đỗ Xe Sân Bay",
      type: "Ô tô & Xe máy",
      slots: "25/300 trống",
      imageColor: "bg-purple-300",
      icon: TrendingUp,
    },
  ];

  return (
    <section className="py-16 bg-white">
      <h2 className="text-3xl font-bold text-center mb-2 text-teal-700">
        TUYẾN PHỔ BIẾN
      </h2>
      <p className="text-center text-gray-500 mb-10">
        Được khách hàng tin tưởng và lựa chọn
      </p>

      {/* Thay vì Carousel, sử dụng Grid với Card đẹp hơn */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {lots.map((lot, index) => (
          <Card
            key={index}
            className="shadow-xl hover:shadow-2xl transition duration-300 border-2 border-gray-100"
          >
            {/* Khối Header (Giả lập Hình ảnh) */}
            <div
              className={`h-40 ${lot.imageColor} flex flex-col items-center justify-center text-white p-4 rounded-t-xl`}
            >
              <Badge
                variant="secondary"
                className="bg-white/30 text-white border-white mb-2"
              >
                <MapPin size={16} className="mr-1" /> Khu vực đỗ xe
              </Badge>
              <h3 className="text-2xl font-bold drop-shadow">{lot.name}</h3>
            </div>

            {/* Nội dung thống kê */}
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-600 flex items-center">
                  <TrendingUp size={16} className="mr-2 text-red-500" /> Thống
                  kê hiện tại
                </p>
                <Badge className="bg-red-100 text-red-700 font-bold border border-red-300">
                  {lot.type}
                </Badge>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <p className="text-sm text-gray-600">Số chỗ trống</p>
                <p className="text-lg font-bold text-green-600">{lot.slots}</p>
              </div>
              <div className="flex justify-between pt-2">
                <p className="text-sm text-gray-600">Loại xe chính</p>
                <p className="text-sm font-bold text-indigo-500 flex items-center">
                  <lot.icon size={16} className="mr-1" /> Ô tô
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default AvailableParkinglotsBlock;
