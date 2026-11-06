import type { Metadata } from "next";
import Script from "next/script";
import MoNeoDatLanding from "@/components/MoNeoDatLanding";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mỏ Neo Đất NDM-10 - Chịu Lực Kéo Tới 450kg, Độ Bền Trên 10 Năm",
  description:
    "Mỏ neo đất NDM-10 thép hợp kim đúc đặc mạ kẽm chịu tải 450kg/điểm, tự khóa 90 độ, không cần đổ bê tông. Căng giàn leo, mái che, giữ cáp chống bão. Độ bền trên 10 năm.",
  openGraph: {
    title: "Mỏ Neo Đất NDM-10 - Chịu Lực Kéo Tới 450kg, Độ Bền Trên 10 Năm",
    description:
      "Thép hợp kim đúc mạ kẽm • Tải trọng 450kg/điểm • Tự khóa 90 độ ngậm đất • Độ bền >10 năm. Ưu đãi giảm 35% hôm nay!",
    images: ["/assets/images_neo/hero_neo.jpg"],
  },
};

export default function HomePage() {
  return (
    <main>
      {/* Microsoft Clarity - Chỉ cài cho trang chủ HomePage */}
      <Script
        id="microsoft-clarity"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "z9cgcnvwtc");
          `,
        }}
      />
      <MoNeoDatLanding />
    </main>
  );
}
