"use client";

import { Category } from "@/types/database";
import {
  Leaf,
  Utensils,
  UtensilsCrossed,
  Coffee,
  Soup,
  CookingPot,
  LayoutGrid,
  Sparkles,
  Salad,
  Wheat,
  ShoppingBasket,
} from "lucide-react";

interface CategoryNavProps {
  categories: Category[];
  activeSlug: string;
  onSelectCategory: (slug: string) => void;
}

export default function CategoryNav({
  categories,
  activeSlug,
  onSelectCategory,
}: CategoryNavProps) {
  // Smart icon mapper that always renders refined Lucide SVG icons
  const renderIcon = (iconName?: string | null, slug?: string) => {
    const key = (iconName || slug || "").toLowerCase();

    // Map by key or common names
    if (key.includes("tat-ca") || key.includes("all") || key.includes("cross")) {
      return <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
    if (key.includes("bep") || key.includes("cooking") || key.includes("pot") || key.includes("🍳")) {
      return <CookingPot className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
    if (key.includes("nguyen-lieu") || key.includes("salad") || key.includes("veg") || key.includes("🥗")) {
      return <Salad className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
    if (key.includes("wheat") || key.includes("grain") || key.includes("rice")) {
      return <Wheat className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
    if (key.includes("an-vat") || key.includes("snack") || key.includes("utensil") || key.includes("🍿")) {
      return <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
    if (key.includes("uong") || key.includes("coffee") || key.includes("tea") || key.includes("🍵")) {
      return <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
    if (key.includes("gia-vi") || key.includes("soup") || key.includes("spice") || key.includes("🧂")) {
      return <Soup className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
    if (key.includes("leaf") || key.includes("la")) {
      return <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
    if (key.includes("grid") || key.includes("khac") || key.includes("box")) {
      return <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
    if (key.includes("basket") || key.includes("gio")) {
      return <ShoppingBasket className="w-5 h-5 sm:w-6 sm:h-6" />;
    }

    return <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />;
  };

  return (
    <nav className="w-full max-w-2xl mx-auto px-4 my-4" aria-label="Danh mục sản phẩm">
      <div className="flex items-center justify-center gap-4 sm:gap-7 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeSlug === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="flex flex-col items-center gap-2 min-w-[64px] sm:min-w-[76px] transition-all group cursor-pointer focus:outline-none"
            >
              {/* Circular Icon Pill */}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs ${
                  isActive
                    ? "bg-[#53683A] text-white ring-4 ring-[#53683A]/20 scale-105 shadow-md"
                    : "bg-[#EAE5D6] text-[#27351E] group-hover:bg-[#dfd9c7] group-hover:scale-105"
                }`}
              >
                {renderIcon(cat.icon, cat.slug)}
              </div>

              {/* Category Name */}
              <span
                className={`text-xs sm:text-sm font-medium text-center transition-colors line-clamp-1 ${
                  isActive ? "text-[#27351E] font-bold" : "text-[#27351E]/80 group-hover:text-[#27351E]"
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
