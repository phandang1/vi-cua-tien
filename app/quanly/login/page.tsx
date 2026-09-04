"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu quản trị");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/quanly");
        router.refresh();
      } else {
        setError(data.error || "Mật khẩu không chính xác");
      }
    } catch (err: any) {
      setError("Đã có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3E8] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white border border-[#E2DAC5] rounded-3xl p-8 shadow-lg">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#53683A] text-white rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-md mb-4">
            🍃
          </div>
          <h1 className="text-2xl font-bold text-[#27351E] font-serif">
            Vị Của Tiên
          </h1>
          <p className="text-xs text-[#27351E]/70 mt-1">
            Khu vực quản trị nội bộ dành riêng cho Quản lý
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#27351E] mb-1.5">
              Mật khẩu truy cập
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#27351E]/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu quản trị..."
                className="w-full pl-10 pr-4 py-3 bg-[#FBF9F4] border border-[#E2DAC5] rounded-xl text-sm text-[#27351E] focus:outline-none focus:border-[#53683A] transition-colors"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#53683A] hover:bg-[#43542f] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang kiểm tra...</span>
              </>
            ) : (
              <>
                <span>Mở khóa Quản lý</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#E2DAC5]/60 text-center">
          <p className="text-[11px] text-[#27351E]/50 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#53683A]" />
            Hệ thống bảo vệ phiên đăng nhập HttpOnly an toàn
          </p>
        </div>
      </div>
    </div>
  );
}
