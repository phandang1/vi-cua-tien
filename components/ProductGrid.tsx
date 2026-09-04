import { Product } from "@/types/database";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export default function ProductGrid({
  products,
  title = "XEM TRÊN SHOPEE",
  subtitle = "Những món ngon, tiện lợi, được Vị Của Tiên tin chọn",
}: ProductGridProps) {
  return (
    <section id="san-pham" className="w-full max-w-5xl mx-auto px-4 my-6">
      {/* Section Header */}
      <div className="text-center mb-5">
        {/* Section Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#27351E] tracking-wide uppercase">
          {title}
        </h2>
      </div>

      {/* Grid: 2 columns on mobile, 4 columns on desktop/tablets */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 bg-[#FFFDF7] rounded-2xl border border-[#E2DAC5] my-4">
          <p className="text-3xl mb-2">🍃</p>
          <p className="text-base sm:text-lg font-bold text-[#27351E]">
            Chưa tìm thấy món ngon phù hợp
          </p>
          <p className="text-xs text-[#27351E]/60 mt-1">
            Vui lòng thử tìm với từ khóa khác hoặc chọn danh mục khác nhé!
          </p>
        </div>
      )}
    </section>
  );
}
