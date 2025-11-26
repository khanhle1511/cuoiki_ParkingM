import React from "react";
// Giả định import các component UI từ thư mục chung của bạn
import { Card, CardContent, CardHeader } from "@/components/ui/card.jsx"; // Giả định Card components
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";

// Import tất cả icons cần thiết từ lucide-react (đã sửa lỗi)
import {
  Search,
  MapPin,
  Calendar,
  Car,
  Clock,
  ChevronDown,
  Truck,
} from "lucide-react";

// Component Input Group tùy chỉnh
const FormInputGroup = ({ label, placeholder, icon: Icon }) => (
  <div className="flex flex-col space-y-1">
    <label className="text-xs font-medium text-gray-500 flex items-center">
      <Icon size={14} className="mr-1 text-orange-400" /> {label}
    </label>
    {/* Giả định sử dụng component Input của shadcn/ui */}
    <Input
      placeholder={placeholder}
      className="h-10 border-gray-300 focus:border-orange-500 bg-gray-50 text-sm"
      readOnly // Giả định chỉ hiển thị, chưa cần nhập liệu
    />
  </div>
);

const FindParkinglotBlock = () => {
  return (
    // -mt-20 để kéo khối tìm kiếm trôi lên trên khối Banner
    <div className="max-w-5xl mx-auto -mt-20 mb-12 z-20 relative">
      <Card className="shadow-2xl border-t-4 border-orange-400 rounded-xl p-0">
        <CardHeader className="pt-4 pb-2">
          {/* Tabs - Mô phỏng giao diện FUTA */}
          <div className="flex space-x-6">
            <Button
              variant="ghost"
              className="text-orange-600 font-bold border-b-2 border-orange-500 rounded-none pb-2 h-auto hover:bg-orange-50"
            >
              <MapPin size={20} className="mr-2" /> Một chiều
            </Button>
            <Button
              variant="ghost"
              className="text-gray-500 font-medium rounded-none pb-2 h-auto hover:text-orange-500"
            >
              <Clock size={20} className="mr-2" /> Khứ hồi
            </Button>
            <span className="ml-auto text-sm text-gray-500 cursor-pointer pt-3">
              Hướng dẫn tìm chỗ đỗ
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-4 bg-white rounded-b-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 1. Khu đỗ xe (Select) */}
            <Select defaultValue="q1">
              <SelectTrigger className="h-12 border-gray-300 bg-gray-50 text-sm">
                <MapPin size={18} className="text-gray-500 mr-2" />
                <div className="flex flex-col text-left">
                  <p className="text-xs text-gray-500">Khu đỗ xe</p>
                  <SelectValue placeholder="Chọn khu đỗ xe" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="q1">Khu Đỗ Xe Q.1</SelectItem>
                <SelectItem value="snb">Khu Đỗ Xe Sân Bay</SelectItem>
              </SelectContent>
            </Select>

            {/* 2. Loại xe (Select) */}
            <Select defaultValue="car">
              <SelectTrigger className="h-12 border-gray-300 bg-gray-50 text-sm">
                <Car size={18} className="text-gray-500 mr-2" />
                <div className="flex flex-col text-left">
                  <p className="text-xs text-gray-500">Loại xe</p>
                  <SelectValue placeholder="Chọn loại xe" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car">Ô tô</SelectItem>
                <SelectItem value="motorcycle">Xe máy</SelectItem>
              </SelectContent>
            </Select>

            {/* 3. Ngày/Giờ (Input Group) */}
            <FormInputGroup
              label="Ngày/Giờ"
              placeholder="19/11/2025"
              icon={Calendar}
            />

            {/* 4. Số lượng chỗ (Input Group) */}
            <FormInputGroup label="Số lượng chỗ" placeholder="1" icon={Truck} />
          </div>

          {/* Nút tìm kiếm */}
          <div className="mt-6 flex justify-center">
            <Button className="px-10 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full shadow-lg transition duration-150 h-auto flex items-center">
              <Search size={20} className="mr-2" /> TÌM CHỖ TRỐNG
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FindParkinglotBlock;
