"use client";

import { useState, useEffect } from "react";
import { Sliders, Save, CheckCircle2, AlertCircle } from "lucide-react";
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
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setSettings(json.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingForward(false));
  }, []);

  const setIsLoadingForward = (val: boolean) => setIsLoading(val);

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
        setFeedback("Đã lưu các cài đặt thành công!");
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
          Cài đặt Thương hiệu & Mạng xã hội
        </h1>
        <p className="text-xs text-[#27351E]/70">
          Tùy chỉnh tên thương hiệu, slogan, câu châm ngôn và các kênh mạng xã hội.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#FFFDF7] p-6 sm:p-8 rounded-2xl border border-[#E2DAC5] shadow-xs space-y-6"
      >
        {/* Brand Information */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#27351E] border-b border-[#E2DAC5] pb-2">
            1. Nhận diện thương hiệu
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
              Câu châm ngôn Hero (Quote)
            </label>
            <input
              type="text"
              value={settings.hero_quote}
              onChange={(e) =>
                setSettings({ ...settings, hero_quote: e.target.value })
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

        {/* Social Links */}
        <div className="space-y-4 pt-4 border-t border-[#E2DAC5]">
          <h2 className="font-serif text-lg font-bold text-[#27351E] border-b border-[#E2DAC5] pb-2">
            2. Liên kết Mạng xã hội
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
                Link Instagram
              </label>
              <input
                type="url"
                value={settings.instagram_url}
                onChange={(e) =>
                  setSettings({ ...settings, instagram_url: e.target.value })
                }
                placeholder="https://instagram.com/..."
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

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-[#27351E]">
                Link Liên hệ (Zalo / Hotline / Messenger)
              </label>
              <input
                type="url"
                value={settings.contact_url}
                onChange={(e) =>
                  setSettings({ ...settings, contact_url: e.target.value })
                }
                placeholder="https://zalo.me/..."
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
            className="bg-[#53683A] hover:bg-[#44552f] text-white font-medium text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Đang lưu..." : "Lưu thay đổi"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
