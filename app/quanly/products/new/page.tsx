"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
  Link2,
} from "lucide-react";
import { Category } from "@/types/database";

export default function QuickAddShopeeProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Form State
  const [shopeeUrl, setShopeeUrl] = useState("");
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metadataFeedback, setMetadataFeedback] = useState<{
    type: "success" | "warning" | "error";
    message: string;
  } | null>(null);

  const [title, setTitle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories on mount
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setCategories(json.data);
          const selectable = json.data.filter((c: Category) => c.slug !== "tat-ca");
          if (selectable.length > 0) {
            setCategoryId(selectable[0].id);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingCategories(false));
  }, []);

  // Smart URL / Text paste handler
  const handleShopeeUrlChange = (val: string) => {
    // 1. Check if user pasted shared text from Shopee App (contains text + link)
    // Example: "[Mã giảm giá] Tên sản phẩm https://s.shopee.vn/..."
    const urlMatch = val.match(/(https?:\/\/[^\s]+)/);
    let targetLink = val.trim();

    if (urlMatch) {
      targetLink = urlMatch[1];
      const textBefore = val.replace(targetLink, "").trim();
      if (textBefore && !title) {
        const cleanTitle = textBefore.replace(/^\[.*?\]\s*/, "").trim();
        if (cleanTitle) setTitle(cleanTitle);
      }
      if (!affiliateUrl) setAffiliateUrl(targetLink);
    }

    setShopeeUrl(targetLink);

    // 2. Check if URL contains product title slug (e.g. /Ten-San-Pham-i.123.456)
    try {
      const parsed = new URL(targetLink);
      const decoded = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
      const slugMatch = decoded.match(/^(.*?)-i\.(\d+)\.(\d+)/);
      if (slugMatch && slugMatch[1] && !title) {
        const extracted = slugMatch[1].replace(/-/g, " ").trim();
        if (extracted) setTitle(extracted);
      }
    } catch {}
  };

  // Client-side image upload handler with automatic canvas resizing/webp compression
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 600;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/webp", 0.85);
          setThumbnailUrl(dataUrl);
        }
      };
      if (typeof event.target?.result === "string") {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Fetch Shopee Metadata
  const handleFetchMetadata = async () => {
    if (!shopeeUrl.trim()) {
      setMetadataFeedback({
        type: "error",
        message: "Vui lòng nhập link sản phẩm Shopee trước khi lấy thông tin.",
      });
      return;
    }

    // Try client-side extraction first
    try {
      const parsed = new URL(shopeeUrl.trim());
      const decoded = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
      const slugMatch = decoded.match(/^(.*?)-i\.(\d+)\.(\d+)/);
      if (slugMatch && slugMatch[1] && !title) {
        const extracted = slugMatch[1].replace(/-/g, " ").trim();
        if (extracted) setTitle(extracted);
      }
    } catch {}

    setIsFetchingMetadata(true);
    setMetadataFeedback(null);

    try {
      const res = await fetch("/api/shopee/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: shopeeUrl }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.title) setTitle(data.title);
        if (data.thumbnail) setThumbnailUrl(data.thumbnail);
        setMetadataFeedback({
          type: "success",
          message: "Đã tự động lấy tiêu đề và hình ảnh từ Shopee thành công!",
        });
      } else {
        setMetadataFeedback({
          type: "warning",
          message:
            data.error ||
            "Shopee chặn bot tải dữ liệu tự động. Bạn hãy dán link ảnh Shopee hoặc bấm 'Chọn ảnh từ máy' bên dưới nhé.",
        });
      }
    } catch (err: any) {
      setMetadataFeedback({
        type: "warning",
        message: "Lỗi kết nối tới server. Bạn có thể nhập thông tin thủ công bên dưới.",
      });
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  // Submit Product Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!title.trim()) {
      setSubmitError("Vui lòng nhập tiêu đề sản phẩm");
      return;
    }

    if (!affiliateUrl.trim()) {
      setSubmitError("Vui lòng nhập link Shopee Affiliate");
      return;
    }

    if (!categoryId) {
      setSubmitError("Vui lòng chọn danh mục cho sản phẩm");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          shopee_url: shopeeUrl.trim(),
          affiliate_url: affiliateUrl.trim(),
          thumbnail_url: thumbnailUrl.trim(),
          category_id: categoryId,
          sort_order: Number(sortOrder) || 0,
          is_featured: isFeatured,
          is_active: isActive,
        }),
      });

      const json = await res.json();
      if (json.success) {
        router.push("/quanly/products");
      } else {
        setSubmitError(json.error || "Không thể lưu sản phẩm");
      }
    } catch (err: any) {
      setSubmitError(err.message || "Lỗi lưu sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/quanly/products"
          className="w-9 h-9 rounded-full bg-white border border-[#E2DAC5] flex items-center justify-center text-[#27351E] hover:bg-cream-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#27351E]">
            Thêm nhanh sản phẩm từ Shopee
          </h1>
          <p className="text-xs text-[#27351E]/70">
            Dán link Shopee gốc, hệ thống sẽ tự động bóc tách tiêu đề và ảnh đại diện.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#FFFDF7] p-6 sm:p-8 rounded-2xl border border-[#E2DAC5] shadow-xs space-y-6"
      >
        {/* Step 1: Shopee URL & Auto Fetch */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#27351E] uppercase tracking-wider">
            1. Link sản phẩm gốc trên Shopee
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={shopeeUrl}
              onChange={(e) => handleShopeeUrlChange(e.target.value)}
              placeholder="Dán link Shopee gốc hoặc link rút gọn..."
              className="flex-1 bg-white border border-[#E2DAC5] rounded-xl px-3.5 py-2.5 text-sm text-[#27351E] focus:outline-none focus:border-[#53683A] focus:ring-2 focus:ring-[#53683A]/20"
            />
            <button
              type="button"
              onClick={handleFetchMetadata}
              disabled={isFetchingMetadata}
              className="bg-[#53683A] hover:bg-[#44552f] disabled:opacity-60 text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 shrink-0"
            >
              {isFetchingMetadata ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang bóc tách...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Lấy thông tin</span>
                </>
              )}
            </button>
          </div>

          {/* Metadata Fetch Feedback */}
          {metadataFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                metadataFeedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : metadataFeedback.type === "warning"
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {metadataFeedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{metadataFeedback.message}</span>
            </div>
          )}
        </div>

        {/* Step 2: Auto-filled / Manual Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#E2DAC5]">
          {/* Thumbnail Preview & URL */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#27351E] uppercase tracking-wider">
              Ảnh sản phẩm (Thumbnail)
            </label>
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-cream-200 border border-[#E2DAC5] flex items-center justify-center">
              {thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnailUrl}
                  alt="Product Thumbnail Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-[#27351E]/40 text-xs">
                  <Upload className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span>Chưa có ảnh đại diện</span>
                </div>
              )}
            </div>

            {/* Hidden File Input for Image Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-white hover:bg-cream-200 text-[#27351E] border border-[#E2DAC5] py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-[#53683A]" />
                <span>Chọn ảnh từ máy</span>
              </button>
            </div>

            <div className="space-y-1">
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="Hoặc dán link ảnh Shopee..."
                className="w-full bg-white border border-[#E2DAC5] rounded-lg px-2.5 py-1.5 text-xs text-[#27351E] focus:outline-none focus:border-[#53683A]"
              />
              <p className="text-[10px] text-[#27351E]/60">
                💡 Chuột phải vào ảnh trên Shopee chọn &ldquo;Sao chép địa chỉ hình ảnh&rdquo; rồi dán vào đây.
              </p>
            </div>
          </div>

          {/* Product Details Form */}
          <div className="md:col-span-2 space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#27351E] uppercase tracking-wider">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Hạt dinh dưỡng mix cao cấp sấy giòn..."
                className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-sm text-[#27351E] focus:outline-none focus:border-[#53683A] focus:ring-2 focus:ring-[#53683A]/20"
                required
              />
            </div>

            {/* Affiliate URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#27351E] uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-[#EE4D2D]" />
                <span>Link Shopee Affiliate của bạn <span className="text-red-500">*</span></span>
              </label>
              <input
                type="url"
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                placeholder="https://shope.ee/... hoặc link affiliate tiếp thị"
                className="w-full bg-white border border-[#EE4D2D]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#27351E] focus:outline-none focus:border-[#EE4D2D] focus:ring-2 focus:ring-[#EE4D2D]/20"
                required
              />
              <p className="text-[11px] text-[#27351E]/60">
                Nút &ldquo;Mua trên Shopee&rdquo; sẽ tự động ghi nhận lượt click và chuyển sang link này.
              </p>
            </div>

            {/* Category Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#27351E] uppercase tracking-wider">
                Danh mục hiển thị <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3.5 py-2.5 text-sm text-[#27351E] focus:outline-none focus:border-[#53683A]"
                disabled={isLoadingCategories}
              >
                {categories
                  .filter((c) => c.slug !== "tat-ca")
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Sort Order & Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#27351E]/80">
                  Thứ tự sắp xếp
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full bg-white border border-[#E2DAC5] rounded-lg px-2.5 py-1.5 text-xs text-[#27351E]"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#53683A] rounded-sm focus:ring-[#53683A]"
                />
                <label htmlFor="isFeatured" className="text-xs font-medium text-[#27351E]">
                  Sản phẩm nổi bật
                </label>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#53683A] rounded-sm focus:ring-[#53683A]"
                />
                <label htmlFor="isActive" className="text-xs font-medium text-[#27351E]">
                  Hiển thị ngay
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {submitError && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2DAC5]">
          <Link
            href="/quanly/products"
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[#27351E] hover:bg-cream-200 transition-colors"
          >
            Hủy bỏ
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#EE4D2D] hover:bg-[#d73212] disabled:opacity-60 text-white font-medium text-xs sm:text-sm px-7 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>Lưu & Xuất bản sản phẩm</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
