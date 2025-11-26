import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Edit,
  Trash2,
  Gift,
  MoreHorizontal,
  Loader2,
  Lock,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// --- COMPONENT MODAL TẶNG VOUCHER (DEFINED INLINE ĐỂ TRÁNH LỖI IMPORT) ---
const GrantVoucherModalInline = ({ isOpen, onClose, user, onSuccess }) => {
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchVouchers = async () => {
        setFetching(true);
        try {
          const res = await axios.get("/api/vouchers/available");
          setVouchers(res.data);
        } catch (err) {
          console.error("Lỗi tải danh sách voucher:", err);
        } finally {
          setFetching(false);
        }
      };
      fetchVouchers();
      setSelectedVoucherId("");
    }
  }, [isOpen]);

  const handleGrant = async () => {
    if (!selectedVoucherId || !user) return;

    setLoading(true);
    try {
      await axios.post("/api/admin/vouchers/grant", {
        userId: user._id,
        voucherId: selectedVoucherId,
      });

      alert(`✅ Đã tặng thành công cho ${user.name}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert(
        "❌ Lỗi: " + (err.response?.data?.message || "Không thể tặng voucher")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-white rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-600 text-xl">
            <Gift className="w-6 h-6" /> Tặng Quà Cho User
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-5">
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-sm text-indigo-900">
            <div className="font-bold text-lg mb-1">{user.name}</div>
            <div className="opacity-80">{user.email}</div>
            <div className="mt-2 pt-2 border-t border-indigo-200 flex justify-between text-xs">
              <span>Đã chi tiêu: {user.totalSpending?.toLocaleString()} đ</span>
              <span>Số lần đỗ: {user.parkingCount || 0}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-semibold">
              Chọn Voucher để tặng
            </Label>
            {fetching ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tải danh
                sách...
              </div>
            ) : (
              <Select
                onValueChange={setSelectedVoucherId}
                value={selectedVoucherId}
              >
                <SelectTrigger className="w-full h-11 border-gray-300 focus:ring-indigo-500">
                  <SelectValue placeholder="-- Chọn một voucher --" />
                </SelectTrigger>
                <SelectContent>
                  {vouchers.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      Không có voucher nào khả dụng.
                    </div>
                  ) : (
                    vouchers.map((v) => (
                      <SelectItem key={v._id} value={v._id}>
                        <span className="font-bold mr-2 text-indigo-700">
                          {v.code}
                        </span>
                        <span className="text-gray-600">- {v.description}</span>
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 rounded">
                          {v.discountType === "PERCENTAGE"
                            ? `-${v.discountValue}%`
                            : `-${v.discountValue.toLocaleString()}đ`}
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleGrant}
            disabled={loading || !selectedVoucherId}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý
              </>
            ) : (
              "Xác nhận Tặng"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- COMPONENT CHÍNH: QUẢN LÝ USER ---
const UserManagementPage = () => {
  const navigate = useNavigate(); // Khởi tạo navigate hook
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State quản lý Modal Tặng quà
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [selectedUserForGrant, setSelectedUserForGrant] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/users/all-users");
      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi tải users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenGrantModal = (user) => {
    setSelectedUserForGrant(user);
    setGrantModalOpen(true);
  };

  // Hàm tạm thời Khóa/Xóa
  const handleUserAction = (action, user) => {
    if (action === "delete") {
      if (window.confirm(`Xác nhận XÓA vĩnh viễn người dùng ${user.name}?`)) {
        alert("Tính năng xóa đang được phát triển.");
        // TODO: Triển khai API DELETE /api/admin/users/:userId
      }
    } else if (action === "lock") {
      if (
        window.confirm(
          `Xác nhận KHÓA tài khoản ${user.name}? User sẽ không thể đăng nhập.`
        )
      ) {
        alert("Tính năng khóa đang được phát triển.");
        // TODO: Triển khai API PUT /api/admin/users/:userId/toggle-status
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Quản lý Người dùng
          </h1>
          <p className="text-slate-500">
            Xem, chỉnh sửa và tặng quà cho thành viên.
          </p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm theo tên, email..."
            className="pl-8 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-100">
            <TableRow>
              <TableHead className="w-[200px]">Tên người dùng</TableHead>{" "}
              <TableHead className="w-[250px]">Email</TableHead>{" "}
              <TableHead className="w-[100px]">Vai trò</TableHead>
              <TableHead className="w-[220px]">
                Thống kê (Loyalty)
              </TableHead>{" "}
              <TableHead className="w-[150px] text-right">Hành động</TableHead>{" "}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex justify-center items-center gap-2 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang tải dữ
                    liệu...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-slate-500"
                >
                  Không tìm thấy người dùng nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-slate-600">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.role === "Admin"
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : user.role === "Manager"
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }
                      variant="secondary"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>

                  {/* Cột Thống kê Loyalty */}
                  <TableCell className="w-[220px]">
                    <div className="text-xs space-y-1.5 p-2 bg-slate-50 rounded-md border border-slate-200">
                      <div className="text-slate-600 flex items-center justify-between">
                        <span className="font-medium">Chi tiêu:</span>
                        <span className="font-bold text-indigo-600">
                          {(user.totalSpending || 0).toLocaleString()} đ
                        </span>
                      </div>
                      <div className="text-slate-600 flex items-center justify-between">
                        <span className="font-medium">Đỗ xe:</span>
                        <span className="font-bold text-teal-600">
                          {user.parkingCount || 0} lần
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right w-[150px]">
                    <div className="flex justify-end items-center gap-2">
                      {/* Nút Tặng Quà */}
                      {user.role === "User" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 h-8 px-3 gap-1.5 shadow-sm transition-all hover:shadow"
                          onClick={() => handleOpenGrantModal(user)}
                          title="Tặng Voucher"
                        >
                          <Gift className="w-4 h-4" />
                          <span className="hidden sm:inline text-xs font-medium">
                            Tặng Quà
                          </span>
                        </Button>
                      )}

                      {/* Dropdown Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 z-50 bg-white shadow-lg border border-gray-200 rounded-md"> 
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>

                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() =>
                              navigate(`/dashboard/users/${user._id}`)
                            } // ⭐ XEM CHI TIẾT
                          >
                            <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() =>
                              navigate(`/dashboard/users/${user._id}/edit`)
                            } // ⭐ SỬA
                          >
                            <Edit className="mr-2 h-4 w-4" /> Sửa thông tin
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* KHÓA TÀI KHOẢN */}
                          <DropdownMenuItem
                            className="cursor-pointer text-orange-600 focus:text-orange-700 focus:bg-orange-50"
                            onClick={() => handleUserAction("lock", user)}
                            disabled={user.role !== "User"}
                          >
                            <Lock className="mr-2 h-4 w-4" /> Khóa tài khoản
                          </DropdownMenuItem>

                          {/* XÓA NGƯỜI DÙNG */}
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50"
                            onClick={() => handleUserAction("delete", user)}
                            disabled={
                              user.role === "Admin" || user.role === "Manager"
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa người dùng
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Render Modal Tặng quà */}
      <GrantVoucherModalInline
        isOpen={grantModalOpen}
        onClose={() => setGrantModalOpen(false)}
        user={selectedUserForGrant}
        onSuccess={() => {
          fetchUsers();
        }}
      />
    </div>
  );
};

export default UserManagementPage;
