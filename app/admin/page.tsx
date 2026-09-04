import Link from "next/link";
import Image from "next/image";
import {
  MousePointerClick,
  Calendar,
  Clock,
  TrendingUp,
  Package,
  PlusCircle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { getAnalyticsSummary, getProducts, getCategories } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [analytics, products, categories] = await Promise.all([
    getAnalyticsSummary(),
    getProducts({ includeInactive: true }),
    getCategories(),
  ]);

  return (
    <div className="space-y-8">
      {/* Top Welcome Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF7] p-6 rounded-2xl border border-[#E2DAC5] shadow-xs">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#27351E]">
            Bảng điều khiển Vị Của Tiên
          </h1>
          <p className="text-xs sm:text-sm text-[#27351E]/70 mt-1">
            Theo dõi hiệu quả chuyển đổi affiliate và quản lý sản phẩm trên mini storefront.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 bg-[#EE4D2D] hover:bg-[#d73212] text-white px-5 py-3 rounded-xl font-medium text-sm shadow-md transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Thêm nhanh sản phẩm Shopee</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Today Clicks */}
        <div className="bg-[#FFFDF7] p-5 rounded-2xl border border-[#E2DAC5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#27351E]/60 uppercase tracking-wider">
              Clicks Hôm nay
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#27351E] mt-3">
            {analytics.totalClicksToday.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#53683A] font-medium mt-1">
            Chuyển hướng mua hàng Shopee
          </p>
        </div>

        {/* 7 Days Clicks */}
        <div className="bg-[#FFFDF7] p-5 rounded-2xl border border-[#E2DAC5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#27351E]/60 uppercase tracking-wider">
              Clicks 7 ngày qua
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#27351E] mt-3">
            {analytics.totalClicks7Days.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#53683A] font-medium mt-1">
            Lưu lượng 1 tuần gần nhất
          </p>
        </div>

        {/* 30 Days Clicks */}
        <div className="bg-[#FFFDF7] p-5 rounded-2xl border border-[#E2DAC5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#27351E]/60 uppercase tracking-wider">
              Clicks 30 ngày qua
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#27351E] mt-3">
            {analytics.totalClicks30Days.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#53683A] font-medium mt-1">
            Hiệu quả tổng tháng
          </p>
        </div>

        {/* Total Products */}
        <div className="bg-[#FFFDF7] p-5 rounded-2xl border border-[#E2DAC5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#27351E]/60 uppercase tracking-wider">
              Sản phẩm hoạt động
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#27351E] mt-3">
            {products.filter((p) => p.is_active).length} / {products.length}
          </p>
          <p className="text-[11px] text-[#53683A] font-medium mt-1">
            Trong {categories.length} danh mục ẩm thực
          </p>
        </div>
      </div>

      {/* Analytics Section & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Clicked Products */}
        <div className="lg:col-span-2 bg-[#FFFDF7] p-6 rounded-2xl border border-[#E2DAC5] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#27351E]">
                Top Sản phẩm được click nhiều nhất
              </h2>
              <p className="text-xs text-[#27351E]/60">
                Xếp hạng dựa trên lượt bấm &ldquo;Mua trên Shopee&rdquo;
              </p>
            </div>
            <Link
              href="/admin/analytics"
              className="text-xs text-[#53683A] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#E2DAC5] text-[#27351E]/60 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Sản phẩm</th>
                  <th className="py-2.5 px-3 text-right">Lượt click</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DAC5]/50">
                {analytics.topProducts.slice(0, 5).map((item, idx) => (
                  <tr key={item.product_id} className="hover:bg-black/2">
                    <td className="py-3 px-3 flex items-center gap-3">
                      <span className="font-bold text-[#53683A] w-4 text-xs">
                        #{idx + 1}
                      </span>
                      {item.thumbnail_url ? (
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-[#E2DAC5]">
                          <Image
                            src={item.thumbnail_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-cream-300 flex items-center justify-center shrink-0">
                          🍃
                        </div>
                      )}
                      <span className="font-medium text-[#27351E] line-clamp-1">
                        {item.title}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#EE4D2D]">
                      {item.click_count} clicks
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/go/${products.find((p) => p.id === item.product_id)?.slug || ""}`}
                        target="_blank"
                        className="text-xs text-[#53683A] hover:underline"
                      >
                        Thử link
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Status & Guidelines */}
        <div className="space-y-6">
          <div className="bg-[#FFFDF7] p-6 rounded-2xl border border-[#E2DAC5] shadow-xs">
            <h3 className="font-serif text-lg font-bold text-[#27351E] mb-2">
              Hướng dẫn nhanh thêm sản phẩm
            </h3>
            <ol className="text-xs text-[#27351E]/80 space-y-2 list-decimal list-inside">
              <li>Mở app/web Shopee, copy link sản phẩm bạn muốn bán.</li>
              <li>Vào mục <strong>&ldquo;Thêm từ Shopee&rdquo;</strong>, dán link vào và bấm <strong>&ldquo;Lấy thông tin&rdquo;</strong>.</li>
              <li>Hệ thống tự động tải hình ảnh và tiêu đề về cho bạn.</li>
              <li>Dán link affiliate Shopee cá nhân của bạn và bấm <strong>&ldquo;Lưu sản phẩm&rdquo;</strong>.</li>
            </ol>
            <div className="mt-4 pt-4 border-t border-[#E2DAC5]">
              <Link
                href="/admin/products/new"
                className="block text-center bg-[#53683A] hover:bg-[#44552f] text-white text-xs font-medium py-2 rounded-xl transition-colors"
              >
                Thử ngay bây giờ →
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#53683A] to-[#27351E] text-white p-6 rounded-2xl shadow-sm">
            <h4 className="font-serif font-bold text-base mb-1">
              Tracking thông minh qua /go/[slug]
            </h4>
            <p className="text-xs text-[#E5EBDB] leading-relaxed">
              Mọi lượt nhấn &ldquo;Mua trên Shopee&rdquo; đều được tự động ghi nhận vào hệ thống phân tích trước khi chuyển tiếp sang link affiliate của bạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
