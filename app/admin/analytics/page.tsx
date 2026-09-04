import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { getAnalyticsSummary, getProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [analytics, products] = await Promise.all([
    getAnalyticsSummary(),
    getProducts({ includeInactive: true }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#27351E]">
          Thống kê Hiệu quả Affiliate Clicks
        </h1>
        <p className="text-xs sm:text-sm text-[#27351E]/70 mt-1">
          Dữ liệu đo lường số lượt người xem bấm nút &ldquo;Mua trên Shopee&rdquo; qua hệ thống tracking trung gian.
        </p>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#FFFDF7] p-6 rounded-2xl border border-[#E2DAC5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#27351E]/60 uppercase">
              Clicks Hôm nay
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#27351E] mt-3">
            {analytics.totalClicksToday.toLocaleString()}
          </p>
          <p className="text-xs text-[#53683A] mt-1 font-medium">
            Lượt bấm mua trong ngày
          </p>
        </div>

        <div className="bg-[#FFFDF7] p-6 rounded-2xl border border-[#E2DAC5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#27351E]/60 uppercase">
              Clicks 7 ngày qua
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#27351E] mt-3">
            {analytics.totalClicks7Days.toLocaleString()}
          </p>
          <p className="text-xs text-[#53683A] mt-1 font-medium">
            Xu hướng trong 1 tuần
          </p>
        </div>

        <div className="bg-[#FFFDF7] p-6 rounded-2xl border border-[#E2DAC5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#27351E]/60 uppercase">
              Clicks 30 ngày qua
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#27351E] mt-3">
            {analytics.totalClicks30Days.toLocaleString()}
          </p>
          <p className="text-xs text-[#53683A] mt-1 font-medium">
            Tổng lượt chuyển hướng tháng
          </p>
        </div>
      </div>

      {/* Top Products Detailed Breakdown */}
      <div className="bg-[#FFFDF7] p-6 rounded-2xl border border-[#E2DAC5] shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-[#27351E]">
          Chi tiết lượt click theo từng sản phẩm
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F7F3E8] border-b border-[#E2DAC5] text-[#27351E]/70 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4"># Thứ hạng</th>
                <th className="py-3 px-4">Sản phẩm</th>
                <th className="py-3 px-3 text-right">Lượt Clicks</th>
                <th className="py-3 px-3 text-right">Tỷ lệ quan tâm</th>
                <th className="py-3 px-4 text-right">Affiliate Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DAC5]/50">
              {analytics.topProducts.map((p, idx) => {
                const totalClicks = analytics.totalClicks30Days || 1;
                const percent = Math.min(100, Math.round((p.click_count / totalClicks) * 100));
                const prodItem = products.find((item) => item.id === p.product_id);

                return (
                  <tr key={p.product_id} className="hover:bg-black/2 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#53683A]">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-4 flex items-center gap-3">
                      {p.thumbnail_url ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#E2DAC5]">
                          <Image
                            src={p.thumbnail_url}
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-cream-300 flex items-center justify-center shrink-0">
                          🍃
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[#27351E] line-clamp-1">
                          {p.title}
                        </p>
                        <span className="text-[11px] text-[#27351E]/50">
                          /go/{prodItem?.slug || "san-pham"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-[#EE4D2D]">
                      {p.click_count.toLocaleString()} clicks
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-cream-300 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#53683A] h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#27351E]/70 font-mono">
                          {percent}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/go/${prodItem?.slug || ""}`}
                        target="_blank"
                        className="text-xs text-[#53683A] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Mở redirect</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
