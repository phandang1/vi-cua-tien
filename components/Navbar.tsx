"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag, Sparkles, Settings, ExternalLink } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="w-full flex items-center justify-between px-5 py-4 z-40 relative max-w-5xl mx-auto">
        {/* Menu toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Mở menu điều hướng"
          className="w-11 h-11 rounded-full bg-white/70 backdrop-blur-sm border border-[#27351E]/10 flex items-center justify-center text-[#27351E] hover:bg-white transition-all shadow-sm active:scale-95"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Right shopping bag with leaf badge */}
        <div className="relative">
          <Link
            href="#san-pham"
            className="w-11 h-11 rounded-full bg-white/70 backdrop-blur-sm border border-[#27351E]/10 flex items-center justify-center text-[#27351E] hover:bg-white transition-all shadow-sm active:scale-95 group"
            title="Xem sản phẩm nổi bật"
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#53683A] text-white rounded-full flex items-center justify-center text-[10px]">
              🍃
            </span>
          </Link>
        </div>
      </header>

      {/* Slide-out Menu Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-80 max-w-[85vw] bg-[#FFFDF7] h-full shadow-2xl p-6 flex flex-col z-10 border-r border-[#E2DAC5]">
            <div className="flex items-center justify-between border-b border-[#E2DAC5] pb-4">
              <span className="font-serif text-xl font-bold text-[#27351E]">
                Vị Của Tiên
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-cream-200 flex items-center justify-center text-[#27351E] hover:bg-cream-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-3">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl font-medium text-[#27351E] hover:bg-[#53683A]/10 hover:text-[#53683A] transition-colors"
              >
                Trang chủ
              </Link>
              <Link
                href="#san-pham"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl font-medium text-[#27351E] hover:bg-[#53683A]/10 hover:text-[#53683A] transition-colors"
              >
                Sản phẩm nổi bật
              </Link>
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl font-medium text-[#53683A] bg-[#53683A]/10 flex items-center justify-between hover:bg-[#53683A]/20 transition-colors mt-4"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Trang quản trị (Admin)
                </span>
                <span className="text-xs bg-[#53683A] text-white px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </Link>
            </nav>

            <div className="mt-auto pt-6 border-t border-[#E2DAC5] text-xs text-[#27351E]/70 space-y-2">
              <p className="font-serif italic text-center">
                “Món ngon hôm nay là hạnh phúc ngày mai”
              </p>
              <p className="text-center font-sans">
                Hotline & Zalo liên hệ: 0988.xxx.xxx
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
