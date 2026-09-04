"use client";

import { useState, useMemo } from "react";
import { Category, Product, SiteSettings } from "@/types/database";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import CategoryNav from "@/components/CategoryNav";
import SocialLinks from "@/components/SocialLinks";
import ProductGrid from "@/components/ProductGrid";
import PromoBanner from "@/components/PromoBanner";
import TrustStrip from "@/components/TrustStrip";
import Footer from "@/components/Footer";

interface StorefrontClientProps {
  categories: Category[];
  initialProducts: Product[];
  settings: SiteSettings;
  defaultCategorySlug?: string;
}

export default function StorefrontClient({
  categories,
  initialProducts,
  settings,
  defaultCategorySlug = "tat-ca",
}: StorefrontClientProps) {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(defaultCategorySlug);
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // Filter products based on selected category and search keyword
  const filteredProducts = useMemo(() => {
    // If user is searching, filter across ALL products
    if (searchKeyword.trim()) {
      const query = searchKeyword.toLowerCase();
      return initialProducts.filter((product) => {
        const matchesTitle = product.title.toLowerCase().includes(query);
        const matchesCategory = product.category?.name.toLowerCase().includes(query);
        return matchesTitle || matchesCategory;
      });
    }

    // Otherwise, filter by selected category
    if (selectedCategorySlug && selectedCategorySlug !== "tat-ca") {
      const cat = categories.find((c) => c.slug === selectedCategorySlug);
      if (cat) {
        return initialProducts.filter((p) => p.category_id === cat.id);
      }
    }

    return initialProducts;
  }, [initialProducts, selectedCategorySlug, searchKeyword, categories]);

  // Determine section titles
  const currentCategory = categories.find((c) => c.slug === selectedCategorySlug);
  const gridTitle = searchKeyword.trim()
    ? `KẾT QUẢ TÌM KIẾM: "${searchKeyword.toUpperCase()}"`
    : selectedCategorySlug === "tat-ca"
    ? "XEM TRÊN SHOPEE"
    : `${(currentCategory?.name || "MÓN NGON").toUpperCase()} - XEM TRÊN SHOPEE`;

  const gridSubtitle = searchKeyword.trim()
    ? `Tìm thấy ${filteredProducts.length} sản phẩm phù hợp`
    : selectedCategorySlug === "tat-ca"
    ? "Những món ngon, tiện lợi, được Vị Của Tiên tin chọn"
    : currentCategory?.description || "Các sản phẩm ẩm thực chất lượng hàng đầu";

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3E8] relative">
      {/* Visual Frame Wrapper for 9:16 mobile look or sleek centered container on desktop */}
      <div className="w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto bg-[#F7F3E8] shadow-xs flex flex-col pt-4">
        {/* Brand Title: Vị Của Tiên */}
        <Hero
          siteName={settings.site_name}
        />

        {/* 2. Social Links Bar */}
        <SocialLinks
          youtubeUrl={settings.youtube_url}
          tiktokUrl={settings.tiktok_url}
          facebookUrl={settings.facebook_url}
          contactUrl={settings.contact_url}
        />

        {/* 3. Search Bar with Real-time suggestions & All-product search */}
        <SearchBar
          products={initialProducts}
          popularKeywords={settings.popular_keywords}
          onSearch={setSearchKeyword}
          onSelectProduct={(p) => {
            setSearchKeyword(p.title);
            const gridEl = document.getElementById("san-pham");
            if (gridEl) gridEl.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* 4. Category Navigation */}
        <CategoryNav
          categories={categories}
          activeSlug={selectedCategorySlug}
          onSelectCategory={(slug) => {
            setSelectedCategorySlug(slug);
            // Smooth scroll to product grid if needed
            const gridEl = document.getElementById("san-pham");
            if (gridEl) {
              gridEl.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />

        {/* 6. Product Grid */}
        <ProductGrid
          products={filteredProducts}
          title={gridTitle}
          subtitle={gridSubtitle}
        />

        {/* 7. Promotional Banner */}
        <PromoBanner />

        {/* 8. Brand Footer */}
        <Footer footerText={settings.footer_text} />
      </div>
    </div>
  );
}
