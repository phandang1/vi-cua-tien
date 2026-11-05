import type { Metadata } from "next";
import BikeLightLanding from "@/components/BikeLightLanding";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đèn Xe Đạp Có Còi Pin Sạc USB LED T6 Chống Nước IP44 — BIKE PRO",
  description:
    "Đèn xe đạp thể thao bóng LED T6 siêu sáng 250 Lumens tích hợp còi 140dB nút bấm rời 30cm, pin sạc 1200mAh USB, chống nước IP44. Kiểm tra hàng trước khi thanh toán COD.",
  openGraph: {
    title: "Đèn Xe Đạp Có Còi Pin Sạc USB LED T6 Chống Nước IP44",
    description:
      "Bóng LED T6 250LM • Còi 140dB • Pin sạc USB 1200mAh • Chống nước IP44. Giá sốc hôm nay chỉ 119K!",
    images: ["/assets/images/hero_product.png"],
  },
};

export default function BikeLightPage() {
  return (
    <main>
      <BikeLightLanding />
    </main>
  );
}
