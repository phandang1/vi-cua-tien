"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Search, X, TrendingUp, Sparkles } from "lucide-react";
import { Product } from "@/types/database";

interface SearchBarProps {
  initialValue?: string;
  products?: Product[];
  onSearch: (keyword: string) => void;
  onSelectProduct?: (product: Product) => void;
}

export default function SearchBar({
  initialValue = "",
  products = [],
  onSearch,
  onSelectProduct,
}: SearchBarProps) {
  const [keyword, setKeyword] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on current keyword
  const suggestions = keyword.trim()
    ? products
        .filter((p) => p.title.toLowerCase().includes(keyword.toLowerCase()))
        .slice(0, 5)
    : [];

  // Popular search keywords suggestions
  const popularKeywords = [
    "Hạt dinh dưỡng",
    "Trà gạo lứt",
    "Trà hoa cúc",
    "Tương ớt",
    "Xoài sấy",
    "Granola",
  ];

  // Handle clicking outside to close suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeyword(val);
    onSearch(val);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword.trim());
    setIsOpen(false);
  };

  const handleClear = () => {
    setKeyword("");
    onSearch("");
    setIsOpen(false);
  };

  const handleSelectKeyword = (kw: string) => {
    setKeyword(kw);
    onSearch(kw);
    setIsOpen(false);
  };

  const handleSelectProduct = (product: Product) => {
    setKeyword(product.title);
    onSearch(product.title);
    setIsOpen(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto px-4 my-3 z-30"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-[#FFFDF7] rounded-full p-1.5 shadow-md border border-[#E2DAC5] focus-within:border-[#53683A] focus-within:ring-2 focus-within:ring-[#53683A]/20 transition-all">
          {/* Search Icon */}
          <div className="pl-4 pr-2 text-[#53683A]">
            <Search className="w-5 h-5 opacity-80" />
          </div>

          {/* Input: Placeholder 'Tìm sản phẩm...' */}
          <input
            type="text"
            value={keyword}
            onChange={handleChange}
            onFocus={() => setIsOpen(true)}
            placeholder="Tìm sản phẩm..."
            className="w-full bg-transparent py-2.5 px-2 text-sm md:text-base text-[#27351E] placeholder:text-[#27351E]/45 focus:outline-none"
          />

          {/* Clear button if text entered */}
          {keyword && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 mr-1 text-[#27351E]/40 hover:text-[#27351E] rounded-full hover:bg-cream-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="bg-[#53683A] hover:bg-[#44552f] text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer"
          >
            Tìm kiếm
          </button>
        </div>
      </form>

      {/* Interactive Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-4 right-4 top-full mt-2 bg-[#FFFDF7] rounded-2xl shadow-xl border border-[#E2DAC5] overflow-hidden z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Product suggestions matching query */}
          {suggestions.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold text-[#53683A] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gợi ý sản phẩm ({suggestions.length})</span>
              </div>
              {suggestions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProduct(p)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#F7F3E8] transition-colors text-left group"
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-cream-300 shrink-0 border border-[#E2DAC5]/80">
                    {p.thumbnail_url ? (
                      <Image
                        src={p.thumbnail_url}
                        alt={p.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">
                        🍃
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#27351E] truncate group-hover:text-[#53683A] transition-colors">
                      {p.title}
                    </p>
                    <span className="text-[11px] text-[#53683A] font-medium">
                      Bấm để chọn xem ngay
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : keyword.trim() ? (
            <div className="p-4 text-center text-xs text-[#27351E]/60">
              Không có sản phẩm nào khớp với &ldquo;{keyword}&rdquo;.
            </div>
          ) : (
            /* Popular Keywords Suggestions when input is focused empty */
            <div className="p-2 space-y-2">
              <div className="text-[11px] font-bold text-[#27351E]/60 uppercase tracking-wider flex items-center gap-1.5 px-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#53683A]" />
                <span>Tìm kiếm phổ biến</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularKeywords.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handleSelectKeyword(kw)}
                    className="text-xs font-medium bg-cream-200 hover:bg-[#53683A]/15 hover:text-[#53683A] text-[#27351E] px-3 py-1.5 rounded-full transition-colors"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
