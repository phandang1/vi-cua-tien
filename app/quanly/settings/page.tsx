"use client";

import { useState, useEffect } from "react";
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  Bell,
  HelpCircle,
} from "lucide-react";
import { SiteSettings } from "@/types/database";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: "Vị Của Tiên",
    tagline: "TINH HOA ẨM THỰC • VỊ NGON TỪ THIÊN NHIÊN",
    description: "",
    hero_quote: "Món ngon hôm nay là hạnh phúc ngày mai",
    youtube_url: "",
    tiktok_url: "",
    facebook_url: "",
    instagram_url: "",
    contact_url: "",
    logo_url: "",
    hero_image_url: "",
    footer_text: "EAT GOOD · LIVE BETTER · BE HAPPIER",
    popular_keywords: "",
    telegram_bot_token: "",
    telegram_chat_id: "",
    telegram_notify_enabled: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Telegram Test State
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setSettings(json.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleTestTelegram = async () => {
    if (!settings.telegram_bot_token?.trim()) {
      alert("Vui lòng nhập Telegram Bot Token trước khi kiểm tra!");
      return;
    }
    if (!settings.telegram_chat_id?.trim()) {
      alert("Vui lòng nhập Telegram Chat ID trước khi kiểm tra!");
      return;
    }

    setIsTestingTelegram(true);
    setTelegramTestResult(null);

    try {
      const res = await fetch("/api/admin/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot_token: settings.telegram_bot_token,
          chat_id: settings.telegram_chat_id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTelegramTestResult({
          success: true,
          message:
            "Tuyệt vời! Đã gửi tin nhắn thử nghiệm thành công tới Telegram của bạn. Hãy mở Telegram kiểm tra nhé!",
        });
      } else {
        setTelegramTestResult({
          success: false,
          message: json.error || "Gửi tin nhắn thử nghiệm thất bại.",
        });
      }
    } catch (err: any) {
      setTelegramTestResult({
        success: false,
        message: "Lỗi kết nối API: " + err.message,
      });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback("Đã lưu các cài đặt và cấu hình thành công!");
      } else {
        setFeedback("Không thể lưu cài đặt: " + (json.error || ""));
      }
    } catch (err: any) {
      setFeedback("Lỗi khi lưu cài đặt: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#27351E]">
          Cài đặt Hệ thống & Thông báo Đơn hàng
        </h1>
        <p className="text-xs text-[#27351E]/70">
          Cấu hình báo đơn tự động về Telegram, nhận diện thương hiệu và các liên kết.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#FFFDF7] p-6 sm:p-8 rounded-2xl border border-[#E2DAC5] shadow-xs space-y-8"
      >
        {/* 1. TELEGRAM BOT NOTIFICATIONS */}
        <div className="space-y-4 bg-sky-50/50 p-5 rounded-2xl border border-sky-200">
          <div className="flex items-center justify-between border-b border-sky-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-xs">
                <Bell className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-[#0f172a]">
                  Báo đơn hàng mới về Telegram
                </h2>
                <p className="text-xs text-slate-500">
                  Tự động gửi tin nhắn báo điện thoại ngay khi khách đặt hàng trên Landing Page
                </p>
              </div>
            </div>

            {/* Switch Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(settings.telegram_notify_enabled)}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    telegram_notify_enabled: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ml-2 text-xs font-bold text-[#27351E]">
                {settings.telegram_notify_enabled ? "ĐANG BẬT" : "TẮT"}
              </span>
            </label>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                <span>1. Telegram Bot Token</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.telegram_bot_token || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    telegram_bot_token: e.target.value,
                  })
                }
                placeholder="VD: 7123456789:AAFsdf8374hfkjsdf..."
                className="w-full bg-white border border-sky-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                <span>2. Telegram Chat ID (hoặc Group ID)</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.telegram_chat_id || ""}
                onChange={(e) =>
                  setSettings({ ...settings, telegram_chat_id: e.target.value })
                }
                placeholder="VD: 123456789 (chat riêng) hoặc -100123456789 (nhóm)"
                className="w-full bg-white border border-sky-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            {/* Test button & Telegram status */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={isTestingTelegram}
                className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                {isTestingTelegram ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi tin test...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>👉 Gửi tin nhắn thử nghiệm tới Telegram</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Feedback */}
            {telegramTestResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                  telegramTestResult.success
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                {telegramTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                )}
                <span>{telegramTestResult.message}</span>
              </div>
            )}

            {/* Instructions box */}
            <div className="bg-white p-3.5 rounded-xl border border-sky-200 text-xs text-slate-600 space-y-1.5 mt-2">
              <div className="font-bold text-sky-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-sky-600" />
                <span>Hướng dẫn 1 phút để lấy Bot Token & Chat ID:</span>
              </div>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  <strong>Lấy Bot Token:</strong> Mở Telegram, tìm kiếm <code>@BotFather</code>, gõ <code>/newbot</code>, đặt tên cho bot. BotFather sẽ gửi cho bạn đoạn mã <strong>HTTP API token</strong>.
                </li>
                <li>
                  <strong>Lấy Chat ID:</strong> Mở bot bạn vừa tạo, bấm <strong>Start</strong>. Sau đó tìm kiếm bot <code>@userinfobot</code> trên Telegram và bấm Start, nó sẽ báo ngay <strong>Id</strong> của bạn (dãy số ví dụ: <code>987654321</code>).
                </li>
                <li>
                  Nếu muốn báo vào Nhóm: Thêm Bot của bạn vào Nhóm Telegram, thêm bot <code>@RawDataBot</code> vào nhóm để xem <code>chat.id</code> (thường bắt đầu bằng <code>-100...</code>).
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* 2. Brand Information */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#27351E] border-b border-[#E2DAC5] pb-2">
            2. Nhận diện thương hiệu & Thông điệp
          </h2>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#27351E] uppercase">
              Tên thương hiệu
            </label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) =>
                setSettings({ ...settings, site_name: e.target.value })
              }
              className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-sm text-[#27351E] focus:outline-none focus:border-[#53683A]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#27351E] uppercase">
              Tagline (Khẩu hiệu)
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) =>
                setSettings({ ...settings, tagline: e.target.value })
              }
              className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-sm text-[#27351E] focus:outline-none focus:border-[#53683A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#27351E] uppercase">
              Thông điệp chân trang (Footer Motto)
            </label>
            <input
              type="text"
              value={settings.footer_text}
              onChange={(e) =>
                setSettings({ ...settings, footer_text: e.target.value })
              }
              className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-sm text-[#27351E] focus:outline-none focus:border-[#53683A]"
            />
          </div>
        </div>

        {/* 3. Social Links */}
        <div className="space-y-4 pt-4 border-t border-[#E2DAC5]">
          <h2 className="font-serif text-lg font-bold text-[#27351E] border-b border-[#E2DAC5] pb-2">
            3. Liên kết Mạng xã hội & Hotline
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#27351E]">
                Link YouTube
              </label>
              <input
                type="url"
                value={settings.youtube_url}
                onChange={(e) =>
                  setSettings({ ...settings, youtube_url: e.target.value })
                }
                placeholder="https://youtube.com/@..."
                className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-xs text-[#27351E] focus:outline-none focus:border-[#53683A]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#27351E]">
                Link TikTok
              </label>
              <input
                type="url"
                value={settings.tiktok_url}
                onChange={(e) =>
                  setSettings({ ...settings, tiktok_url: e.target.value })
                }
                placeholder="https://tiktok.com/@..."
                className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-xs text-[#27351E] focus:outline-none focus:border-[#53683A]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#27351E]">
                Link Facebook
              </label>
              <input
                type="url"
                value={settings.facebook_url}
                onChange={(e) =>
                  setSettings({ ...settings, facebook_url: e.target.value })
                }
                placeholder="https://facebook.com/..."
                className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-xs text-[#27351E] focus:outline-none focus:border-[#53683A]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#27351E]">
                Link Liên hệ (Zalo / Hotline)
              </label>
              <input
                type="text"
                value={settings.contact_url}
                onChange={(e) =>
                  setSettings({ ...settings, contact_url: e.target.value })
                }
                placeholder="https://zalo.me/... hoặc tel:0912345678"
                className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-xs text-[#27351E] focus:outline-none focus:border-[#53683A]"
              />
            </div>
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-[#E2DAC5]">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#53683A] hover:bg-[#44552f] disabled:opacity-50 text-white font-medium text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Đang lưu cài đặt..." : "Lưu tất cả thay đổi"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
