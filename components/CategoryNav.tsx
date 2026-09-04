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
  // Helper to get matching icon
  const renderIcon = (iconName?: string | null) => {
    // If icon contains emoji characters, render directly as text
    if (iconName && /\p{Emoji}/u.test(iconName) && iconName.length <= 4) {
      return <span className="text-2xl leading-none">{iconName}</span>;
    }
    switch (iconName) {
      case "leaf":
        return <Leaf className="w-6 h-6" />;
      case "utensils":
        return <Utensils className="w-6 h-6" />;
      case "utensils-crossed":
      case "food":
      case "all":
        return <UtensilsCrossed className="w-6 h-6" />;
      case "coffee":
      case "tea":
        return <Coffee className="w-6 h-6" />;
      case "soup":
      case "pot":
        return <Soup className="w-6 h-6" />;
      case "cooking-pot":
      case "kitchen":
        return <CookingPot className="w-6 h-6" />;
      case "grid":
        return <LayoutGrid className="w-6 h-6" />;
      case "salad":
      case "vegetable":
        return <Salad className="w-6 h-6" />;
      case "wheat":
      case "ingredient":
      case "nguyen-lieu":
        return <Wheat className="w-6 h-6" />;
      case "basket":
      case "shopping":
        return <ShoppingBasket className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <nav className="w-full max-w-3xl mx-auto px-4 my-4" aria-label="Danh mục sản phẩm">
      <div className="flex items-center justify-between sm:justify-center sm:gap-6 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeSlug === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="flex flex-col items-center gap-1.5 min-w-[62px] sm:min-w-[72px] transition-all group cursor-pointer focus:outline-none"
            >
              {/* Circular Icon Pill */}
              <div
                className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                  isActive
                    ? "bg-[#53683A] text-white ring-4 ring-[#53683A]/20 scale-105"
                    : "bg-[#E6E2D3] text-[#27351E] group-hover:bg-[#dad5c3] group-hover:scale-105"
                }`}
              >
                {renderIcon(cat.icon)}
              </div>

              {/* Category Name */}
              <span
                className={`text-xs sm:text-sm font-semibold text-center transition-colors line-clamp-1 ${
                  isActive ? "text-[#27351E] font-extrabold scale-105" : "text-[#27351E]/85 group-hover:text-[#27351E]"
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
