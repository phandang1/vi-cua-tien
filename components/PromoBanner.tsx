import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function PromoBanner() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 my-6 flex justify-center">
      <Link
        href="#san-pham"
        className="inline-flex items-center justify-center gap-2 bg-[#FFFDF7] hover:bg-white text-[#27351E] font-semibold text-sm px-8 py-3 rounded-full border border-[#E2DAC5] shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 group"
      >
        <span>Xem thêm</span>
        <ChevronDown className="w-4 h-4 text-[#53683A] group-hover:translate-y-0.5 transition-transform" />
      </Link>
    </div>
  );
}
