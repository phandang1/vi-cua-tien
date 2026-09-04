"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Calendar,
  RefreshCw,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface TopProduct {
  product_id: string;
  title: string;
  thumbnail_url?: string | null;
  slug?: string;
  click_count: number;
}

interface DailyBreakdown {
  date: string;
  count: number;
}

interface AnalyticsData {
  totalClicksToday?: number;
  totalClicks7Days?: number;
  totalClicks30Days?: number;
  rangeCount?: number;
  topProducts: TopProduct[];
  dailyBreakdown?: DailyBreakdown[];
}

const PRESETS = [
  { label: "Hôm nay", days: 0 },
  { label: "7 ngày", days: 7 },
  { label: "30 ngày", days: 30 },
  { label: "90 ngày", days: 90 },
];

function formatDate(d: Date) {
  return d.toISOString().substring(0, 10);
}

export default function AdminAnalyticsPage() {
  const today = formatDate(new Date());
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [isCustom, setIsCustom] = useState(false);
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [summary, setSummary] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const loadSummary = useCallback(async () => {
    const res = await fetch("/api/admin/analytics", { cache: "no-store" });
    const json = await res.json();
    if (json.success) setSummary(json);
  }, []);

  const loadRange = useCallback(async (from: string, to: string) => {
    setIsLoading(true);
    const res = await fetch(`/api/admin/analytics?from=${from}&to=${to}`, { cache: "no-store" });
    const json = await res.json();
    if (json.success) setData(json);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([loadSummary(), loadRange(today, today)]);
      setIsLoading(false);
    };
    init();
  }, []);

  const applyPreset = (days: number, idx: number) => {
    setActivePreset(idx);
    setIsCustom(false);
    if (days === 0) {
      setFromDate(today);
      setToDate(today);
      loadRange(today, today);
    } else {
      const from = formatDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
      setFromDate(from);
      setToDate(today);
      loadRange(from, today);
    }
  };

  const applyCustomRange = () => {
    if (fromDate && toDate) {
      setIsCustom(true);
      setActivePreset(null);
      loadRange(fromDate, toDate);
    }
  };

  const handleReset = async () => {
    if (!confirm("Bạn có chắc muốn xóa toàn bộ dữ liệu click? Hành động này không thể hoàn tác.")) return;
    setIsResetting(true);
    const res = await fetch("/api/admin/analytics", { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      await Promise.all([loadSummary(), loadRange(fromDate, toDate)]);
      alert("Đã reset toàn bộ dữ liệu click thành công!");
    }
    setIsResetting(false);
  };

  const maxDaily = data?.dailyBreakdown?.reduce((m, d) => Math.max(m, d.count), 1) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#27351E]">
            Thống kê Clicks Affiliate
          </h1>
          <p className="text-xs sm:text-sm text-[#27351E]/70 mt-1">
            Lượt bấm nút &ldquo;Xem trên Shopee&rdquo; được ghi nhận theo thời gian thực.
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={isResetting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {isResetting ? "Đang xóa..." : "Reset dữ liệu"}
        </button>
      </div>

      {/* Summary KPI Cards - always shown */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Hôm nay", value: summary.totalClicksToday ?? 0, color: "amber" },
            { label: "7 ngày qua", value: summary.totalClicks7Days ?? 0, color: "emerald" },
            { label: "30 ngày qua", value: summary.totalClicks30Days ?? 0, color: "blue" },
          ].map((card) => (
            <div key={card.label} className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#E2DAC5] shadow-xs">
              <p className="text-[10px] sm:text-xs font-medium text-[#27351E]/60 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#27351E] mt-2">{card.value.toLocaleString()}</p>
              <p className="text-[10px] text-[#53683A] font-medium mt-1">lượt click</p>
            </div>
          ))}
        </div>
      )}

      {/* Date Range Picker */}
      <div className="bg-[#FFFDF7] p-5 rounded-2xl border border-[#E2DAC5] shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-[#53683A]" />
          <span className="text-sm font-semibold text-[#27351E]">Lọc theo khoảng thời gian</span>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p, idx) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.days, idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activePreset === idx
                  ? "bg-[#53683A] text-white"
                  : "bg-[#E6E2D3] text-[#27351E] hover:bg-[#dad5c3]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[10px] font-medium text-[#27351E]/60 mb-1 uppercase">Từ ngày</label>
            <input
              type="date"
              value={fromDate}
              max={toDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-[#E2DAC5] rounded-lg px-3 py-2 text-sm text-[#27351E] bg-white focus:outline-none focus:ring-2 focus:ring-[#53683A]/30"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#27351E]/60 mb-1 uppercase">Đến ngày</label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              max={today}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-[#E2DAC5] rounded-lg px-3 py-2 text-sm text-[#27351E] bg-white focus:outline-none focus:ring-2 focus:ring-[#53683A]/30"
            />
          </div>
          <button
            onClick={applyCustomRange}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#53683A] hover:bg-[#3f5229] text-white rounded-lg text-sm font-medium transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Xem
          </button>
        </div>

        {/* Range Result */}
        {data && !isLoading && (
          <div className="mt-4 pt-4 border-t border-[#E2DAC5]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-5 h-5 text-[#53683A]" />
                <span className="text-2xl font-bold text-[#27351E]">
                  {(data.rangeCount ?? 0).toLocaleString()}
                </span>
                <span className="text-sm text-[#27351E]/60">clicks</span>
              </div>
              <span className="text-xs text-[#27351E]/50">
                từ {fromDate} đến {toDate}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Daily Chart */}
      {data?.dailyBreakdown && data.dailyBreakdown.length > 0 && (
        <div className="bg-[#FFFDF7] p-5 rounded-2xl border border-[#E2DAC5] shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[#53683A]" />
            <span className="text-sm font-semibold text-[#27351E]">Clicks theo ngày</span>
          </div>
          <div className="flex items-end gap-1.5 h-32 overflow-x-auto pb-1">
            {data.dailyBreakdown.map((d) => (
              <div key={d.date} className="flex flex-col items-center gap-1 min-w-[36px]">
                <span className="text-[9px] text-[#27351E]/60 font-medium">{d.count}</span>
                <div
                  className="w-full bg-[#53683A] rounded-t-md transition-all"
                  style={{ height: `${Math.max(4, (d.count / maxDaily) * 100)}px` }}
                  title={`${d.date}: ${d.count} clicks`}
                />
                <span className="text-[9px] text-[#27351E]/50 rotate-45 origin-left whitespace-nowrap">
                  {d.date.substring(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Products */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#E2DAC5] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E2DAC5] flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#53683A]" />
          <span className="text-sm font-semibold text-[#27351E]">
            Top sản phẩm được click nhiều nhất
            <span className="font-normal text-[#27351E]/50 ml-1">
              ({fromDate === toDate ? fromDate : `${fromDate} → ${toDate}`})
            </span>
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-sm text-[#27351E]/50">Đang tải...</div>
        ) : !data?.topProducts?.length ? (
          <div className="text-center py-10 text-sm text-[#27351E]/50">
            Chưa có dữ liệu click trong khoảng thời gian này.
          </div>
        ) : (
          <div className="divide-y divide-[#E2DAC5]/50">
            {data.topProducts.map((p, idx) => (
              <div key={p.product_id} className="flex items-center gap-4 p-4 hover:bg-black/2 transition-colors">
                <span className={`text-sm font-bold w-6 text-center ${idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-orange-400" : "text-[#27351E]/40"}`}>
                  #{idx + 1}
                </span>
                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-cream-200 shrink-0 border border-[#E2DAC5]">
                  {p.thumbnail_url ? (
                    <Image src={p.thumbnail_url} alt={p.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">🍃</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#27351E] truncate">{p.title}</p>
                  {p.slug && (
                    <a
                      href={`/go/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#53683A] hover:underline flex items-center gap-1"
                    >
                      /go/{p.slug} <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-base font-bold text-[#EE4D2D]">{p.click_count.toLocaleString()}</span>
                  <p className="text-[10px] text-[#27351E]/50">clicks</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
