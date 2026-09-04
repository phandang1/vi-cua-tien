"use client";

import Image from "next/image";
import { Product } from "@/types/database";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const handleShopeeClick = () => {
    // Fire background click tracking without blocking navigation
    fetch(`/go/${product.slug}`, { method: "HEAD" }).catch(() => {});
  };

  return (
    <div className="bg-[#FFFDF7] rounded-2xl overflow-hidden border border-[#E2DAC5]/70 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group h-full">
      {/* 1:1 Aspect Ratio Product Thumbnail */}
      <div className="relative aspect-square w-full overflow-hidden bg-cream-200">
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 220px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-[#53683A]/30">
            🍃
          </div>
        )}
      </div>

      {/* Card Body: Title & Shopee Button */}
      <div className="p-3 flex flex-col flex-grow justify-between gap-3 text-center">
        {/* Title */}
        <h3
          title={product.title}
          className="text-sm sm:text-base font-semibold text-[#27351E] truncate w-full text-center leading-normal"
        >
          {product.title}
        </h3>

        {/* Shopee CTA Button -> uses affiliate_url directly */}
        <a
          href={product.affiliate_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleShopeeClick}
          className="w-full bg-[#EE4D2D] hover:bg-[#d73212] active:scale-[0.98] text-white py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm shadow-xs transition-all duration-200 shopee-btn"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/shopee-icon-white.png"
            alt="Shopee"
            className="w-4 h-4 object-contain shrink-0"
          />
          <span className="whitespace-nowrap">Xem trên Shopee</span>
        </a>
      </div>
    </div>
  );
}
