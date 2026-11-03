import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  PlusCircle,
  FolderTree,
  BarChart3,
  Sliders,
  ExternalLink,
  LogOut,
  Leaf,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { name: "Tổng quan", href: "/quanly", icon: LayoutDashboard },
    { name: "Đơn hàng", href: "/quanly/orders", icon: ShoppingBag, highlight: true },
    { name: "Sản phẩm", href: "/quanly/products", icon: Package },
    { name: "Thêm từ Shopee", href: "/quanly/products/new", icon: PlusCircle },
    { name: "Danh mục", href: "/quanly/categories", icon: FolderTree },
    { name: "Thống kê Clicks", href: "/quanly/analytics", icon: BarChart3 },
    { name: "Cài đặt & Telegram", href: "/quanly/settings", icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6EF] flex flex-col">
      {/* Top Admin Navbar */}
      <header className="bg-[#FFFDF7] border-b border-[#E2DAC5] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/quanly"
              className="flex items-center gap-2 font-serif text-xl font-bold text-[#27351E]"
            >
              <span className="w-8 h-8 rounded-full bg-[#53683A] text-white flex items-center justify-center text-sm shadow-xs">
                🍃
              </span>
              <span>Vị Của Tiên Quản Lý</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#53683A] hover:text-[#27351E] bg-[#E8EEDB] hover:bg-[#dbe4cc] px-3.5 py-1.5 rounded-full transition-colors"
            >
              <span>Xem website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </form>
          </div>
        </div>

        {/* Secondary Navigation Row */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-2 scrollbar-none border-t border-[#E2DAC5]/40 text-xs sm:text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  item.highlight
                    ? "bg-[#53683A] text-white hover:bg-[#44552f]"
                    : "text-[#27351E]/80 hover:text-[#27351E] hover:bg-black/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Admin Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
