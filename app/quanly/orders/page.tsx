"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  XCircle,
  Trash2,
  Copy,
  RefreshCw,
  ExternalLink,
  DollarSign,
  Package,
} from "lucide-react";
import { Order } from "@/types/database";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: any }
> = {
  pending: {
    label: "Chờ xác nhận",
    bg: "bg-amber-100",
    text: "text-amber-800 border-amber-300",
    icon: Clock,
  },
  confirmed: {
    label: "Đã xác nhận",
    bg: "bg-blue-100",
    text: "text-blue-800 border-blue-300",
    icon: CheckCircle2,
  },
  shipping: {
    label: "Đang giao hàng",
    bg: "bg-purple-100",
    text: "text-purple-800 border-purple-300",
    icon: Truck,
  },
  delivered: {
    label: "Hoàn thành",
    bg: "bg-emerald-100",
    text: "text-emerald-800 border-emerald-300",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Đã hủy",
    bg: "bg-rose-100",
    text: "text-rose-800 border-rose-300",
    icon: XCircle,
  },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/orders?status=${statusFilter}&search=${encodeURIComponent(
          search
        )}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (json.success) {
        setOrders(json.data || []);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (id: string, newStatus: Order["status"]) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
        );
      } else {
        alert(json.error || "Không thể cập nhật trạng thái");
      }
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (id: string, code: string) => {
    if (!confirm(`Bạn có chắc muốn xóa đơn hàng #${code}?`)) return;
    try {
      const res = await fetch(`/api/admin/orders?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      } else {
        alert(json.error || "Không thể xóa đơn hàng");
      }
    } catch (err: any) {
      alert("Lỗi xóa đơn: " + err.message);
    }
  };

  const handleCopyShippingInfo = (order: Order) => {
    const text = `Họ tên: ${order.customer_name}
SĐT: ${order.customer_phone}
Địa chỉ: ${order.customer_address}
Sản phẩm: ${order.combo_name} (${order.color || "Đen Tuyền"})
Tiền thu hộ COD: ${(order.total_price || 0).toLocaleString("vi-VN")}đ`;

    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const formatVND = (num: number) => (num || 0).toLocaleString("vi-VN") + "đ";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#27351E] flex items-center gap-2">
            <span>Quản lý Đơn hàng</span>
            <span className="text-xs bg-[#53683A] text-white px-2.5 py-1 rounded-full font-sans">
              {stats.totalOrders} đơn
            </span>
          </h1>
          <p className="text-xs text-[#27351E]/70 mt-1">
            Theo dõi khách đặt mua từ Landing Page, gọi điện chốt đơn và điều phối giao hàng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-1.5 bg-white border border-[#E2DAC5] hover:bg-black/5 text-[#27351E] px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Tải lại</span>
          </button>

          <Link
            href="/quanly/settings"
            className="inline-flex items-center gap-1.5 bg-[#53683A] hover:bg-[#44552f] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Cài đặt Telegram</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#E2DAC5] shadow-xs">
          <div className="text-xs text-[#27351E]/70 font-medium">Đơn mới hôm nay</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#27351E] mt-1">
            {stats.todayOrders}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Khách vừa đặt trong ngày
          </div>
        </div>

        <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#E2DAC5] shadow-xs">
          <div className="text-xs text-[#27351E]/70 font-medium">Cần gọi xác nhận</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
            {stats.pendingOrders}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
            Đang chờ gọi chốt đơn
          </div>
        </div>

        <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#E2DAC5] shadow-xs">
          <div className="text-xs text-[#27351E]/70 font-medium">Tổng số đơn hàng</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#27351E] mt-1">
            {stats.totalOrders}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Lưu trữ toàn bộ đơn
          </div>
        </div>

        <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#E2DAC5] shadow-xs">
          <div className="text-xs text-[#27351E]/70 font-medium">Tổng doanh số COD</div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#e11d48] mt-1">
            {formatVND(stats.totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Ước tính tiền thu hộ
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#E2DAC5] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none text-xs">
            {[
              { key: "all", label: "Tất cả" },
              { key: "pending", label: "Chờ xác nhận" },
              { key: "confirmed", label: "Đã xác nhận" },
              { key: "shipping", label: "Đang giao" },
              { key: "delivered", label: "Hoàn thành" },
              { key: "cancelled", label: "Đã hủy" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                  statusFilter === tab.key
                    ? "bg-[#53683A] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-[#E2DAC5] hover:bg-black/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full md:w-72"
          >
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, SĐT, mã đơn..."
              className="w-full bg-white border border-[#E2DAC5] rounded-xl pl-9 pr-3 py-2 text-xs text-[#27351E] focus:outline-none focus:border-[#53683A]"
            />
          </form>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#E2DAC5] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
            <span>Đang tải danh sách đơn hàng...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 px-4 text-slate-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <div className="font-bold text-base text-slate-700">
              Chưa có đơn hàng nào
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Khi khách hàng điền form đặt mua trên Landing Page, đơn sẽ lập tức xuất hiện tại đây và báo về Telegram!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F6EF] border-b border-[#E2DAC5] text-[#27351E]/70 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Mã đơn & Thời gian</th>
                  <th className="py-3 px-4">Khách hàng & Địa chỉ</th>
                  <th className="py-3 px-4">Gói sản phẩm</th>
                  <th className="py-3 px-4 text-right">Tổng tiền (COD)</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DAC5]/60">
                {orders.map((order) => {
                  const statusInfo =
                    STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusInfo.icon;
                  const dateFormatted = order.created_at
                    ? new Date(order.created_at).toLocaleString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                        hour12: false,
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                  const isFromFbAds =
                    order.traffic_source === "fb_ads" ||
                    (order.note && order.note.includes("Facebook Ads")) ||
                    Boolean(order.fbclid);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-black/2 transition-colors"
                    >
                      {/* Mã đơn */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-sm text-[#e11d48]">
                          #{order.order_code}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{dateFormatted}</span>
                        </div>
                        {isFromFbAds ? (
                          <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>🟢 Facebook Ads</span>
                          </div>
                        ) : (
                          <div
                            className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
                            title="Đơn không có fbclid, có thể là đơn ảo hoặc khách vào trực tiếp"
                          >
                            <span>⚠️</span>
                            <span>Vào trực tiếp</span>
                          </div>
                        )}
                      </td>

                      {/* Khách hàng */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="font-bold text-sm text-[#27351E]">
                          {order.customer_name}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <a
                            href={`tel:${order.customer_phone}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{order.customer_phone}</span>
                          </a>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 flex items-start gap-1">
                          <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-slate-400" />
                          <span>{order.customer_address}</span>
                        </div>
                        {order.note && (
                          <div className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-md mt-1.5 border border-amber-200">
                            <strong>Ghi chú:</strong> {order.note}
                          </div>
                        )}
                      </td>

                      {/* Gói sản phẩm */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-800">
                          {order.combo_name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 space-y-0.5">
                          {order.product_name && (
                            <div className="text-slate-600 font-medium line-clamp-1">{order.product_name}</div>
                          )}
                          <div>
                            {order.color ? `Phân loại: ${order.color}` : "Đen Tuyền"}
                          </div>
                        </div>
                      </td>

                      {/* Tổng tiền */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="font-extrabold text-sm text-[#b91c1c]">
                          {formatVND(order.total_price)}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {order.shipping_fee === 0 ? "Freeship" : `Ship: ${formatVND(order.shipping_fee)}`}
                        </div>
                      </td>

                      {/* Trạng thái Dropdown */}
                      <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) =>
                            handleUpdateStatus(
                              order.id,
                              e.target.value as Order["status"]
                            )
                          }
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${statusInfo.bg} ${statusInfo.text}`}
                        >
                          <option value="pending">⏳ Chờ xác nhận</option>
                          <option value="confirmed">📞 Đã xác nhận</option>
                          <option value="shipping">🚚 Đang giao hàng</option>
                          <option value="delivered">✅ Hoàn thành</option>
                          <option value="cancelled">❌ Đã hủy</option>
                        </select>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy ship info */}
                          <button
                            onClick={() => handleCopyShippingInfo(order)}
                            title="Sao chép thông tin gửi hàng (Tên, SĐT, ĐC, Tiền COD)"
                            className={`p-1.5 rounded-lg border transition-all ${
                              copiedId === order.id
                                ? "bg-emerald-500 text-white border-emerald-600"
                                : "bg-white text-slate-600 border-[#E2DAC5] hover:bg-black/5"
                            }`}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() =>
                              handleDeleteOrder(order.id, order.order_code)
                            }
                            title="Xóa đơn hàng này"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {copiedId === order.id && (
                          <div className="text-[10px] text-emerald-600 font-bold mt-1">
                            ✓ Đã copy gửi ship!
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
