import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vị Của Tiên Food — Tinh Hoa Ẩm Thực, Vị Ngon Từ Thiên Nhiên",
  description:
    "Khám phá các sản phẩm ẩm thực, đồ ăn vặt bổ dưỡng, trà thảo mộc thanh nhiệt và gia vị truyền thống được Vị Của Tiên Food tuyển chọn.",
  openGraph: {
    title: "Vị Của Tiên Food — Tinh Hoa Ẩm Thực",
    description: "Món ngon hôm nay là hạnh phúc ngày mai. Sản phẩm chọn lọc uy tín từ Shopee.",
    url: "https://www.vicuatien.food",
    siteName: "Vị Của Tiên Food",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="min-h-screen bg-[#F7F3E8] text-[#27351E] font-sans antialiased selection:bg-[#53683A]/20 selection:text-[#27351E]">
        {children}
      </body>
    </html>
  );
}
