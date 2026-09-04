import { Leaf, Truck, ShieldCheck } from "lucide-react";

export default function TrustStrip() {
  const trustItems = [
    {
      icon: <Leaf className="w-6 h-6 text-[#27351E]" />,
      title: "Sản phẩm chính hãng",
      desc: "Từ Shopee uy tín",
    },
    {
      icon: <Truck className="w-6 h-6 text-[#27351E]" />,
      title: "Giao hàng nhanh",
      desc: "Tiện lợi, an toàn",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#27351E]" />,
      title: "An tâm mua sắm",
      desc: "Được nhiều người tin chọn",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 my-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#E2DAC5] bg-[#FFFDF7]/60 rounded-2xl py-4 sm:py-6 px-4 border border-[#E2DAC5]/50">
        {trustItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3.5 px-4 py-2 sm:py-0 justify-start sm:justify-center"
          >
            <div className="shrink-0 p-2 rounded-full bg-[#E6E2D3]/60">
              {item.icon}
            </div>
            <div>
              <h4 className="font-sans text-xs sm:text-sm font-semibold text-[#27351E]">
                {item.title}
              </h4>
              <p className="font-sans text-[11px] sm:text-xs text-[#27351E]/70">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
