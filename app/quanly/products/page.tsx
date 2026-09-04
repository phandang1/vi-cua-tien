"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle,
  Search,
  ExternalLink,
  Trash2,
  Edit2,
  Star,
  Eye,
  EyeOff,
  Filter,
  X,
  Save,
  Loader2,
  Upload,
} from "lucide-react";
import { Product, Category } from "@/types/database";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>("");

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "featured" | "hidden">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products", { cache: "no-store" }),
        fetch("/api/admin/categories", { cache: "no-store" }),
      ]);
      const prodJson = await prodRes.json();
      const catJson = await catRes.json();

      if (prodJson.success) {
        setProducts(prodJson.data);
      } else {
        setLoadError(prodJson.error || "Không thể tải sản phẩm từ Supabase");
      }
      if (catJson.success) setCategories(catJson.data);
    } catch (err) {
      console.error("Error loading products:", err);
      setLoadError("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = async (product: Product) => {
    try {
      const updated = { ...product, is_active: !product.is_active };
      setProducts(products.map((p) => (p.id === product.id ? updated : p)));

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          title: product.title,
          category_id: product.category_id,
          affiliate_url: product.affiliate_url,
          shopee_url: product.shopee_url,
          thumbnail_url: product.thumbnail_url,
          slug: product.slug,
          sort_order: product.sort_order,
          is_featured: product.is_featured,
          is_active: !product.is_active,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || "Không thể cập nhật trạng thái");
        loadData();
      }
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const updated = { ...product, is_featured: !product.is_featured };
      setProducts(products.map((p) => (p.id === product.id ? updated : p)));

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          title: product.title,
          category_id: product.category_id,
          affiliate_url: product.affiliate_url,
          shopee_url: product.shopee_url,
          thumbnail_url: product.thumbnail_url,
          slug: product.slug,
          sort_order: product.sort_order,
          is_featured: !product.is_featured,
          is_active: product.is_active,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || "Không thể cập nhật trạng thái nổi bật");
        loadData();
      }
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      setProducts(products.filter((p) => p.id !== id));
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || "Không thể xóa sản phẩm");
        loadData();
      }
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setEditError("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.title.trim()) {
      setEditError("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (!editingProduct.affiliate_url.trim()) {
      setEditError("Vui lòng nhập link Shopee Affiliate");
      return;
    }

    setIsSavingEdit(true);
    setEditError("");

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduct.id,
          title: editingProduct.title,
          category_id: editingProduct.category_id,
          affiliate_url: editingProduct.affiliate_url,
          shopee_url: editingProduct.shopee_url,
          thumbnail_url: editingProduct.thumbnail_url,
          slug: editingProduct.slug,
          sort_order: editingProduct.sort_order,
          is_featured: editingProduct.is_featured,
          is_active: editingProduct.is_active,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setEditingProduct(null);
        await loadData();
      } else {
        setEditError(json.error || "Lỗi lưu chỉnh sửa");
      }
    } catch (err: any) {
      setEditError(err.message || "Lỗi lưu sản phẩm");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Filter list
  const filteredProducts = products.filter((p) => {
    if (search.trim() && !p.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterType === "featured" && !p.is_featured) return false;
    if (filterType === "hidden" && p.is_active) return false;
    if (filterCategory !== "all" && p.category_id !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#27351E]">
            Quản lý Sản phẩm ({products.length})
          </h1>
          <p className="text-xs text-[#27351E]/70">
            Quản lý liên kết affiliate, chỉnh sửa thông tin, bật/tắt hiển thị trên storefront.
          </p>
        </div>

        <Link
          href="/quanly/products/new"
          className="inline-flex items-center gap-2 bg-[#EE4D2D] hover:bg-[#d73212] text-white px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-sm transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Thêm sản phẩm mới</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#E2DAC5] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#27351E]/50" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E2DAC5] rounded-xl pl-9 pr-3 py-2 text-xs text-[#27351E] focus:outline-none focus:border-[#53683A]"
          />
        </div>

        {/* Filter Badges & Dropdown */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex bg-cream-200 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === "all" ? "bg-white text-[#27351E] shadow-xs font-bold" : "text-[#27351E]/70"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType("featured")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === "featured" ? "bg-white text-[#53683A] shadow-xs font-bold" : "text-[#27351E]/70"
              }`}
            >
              Nổi bật ⭐
            </button>
            <button
              onClick={() => setFilterType("hidden")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === "hidden" ? "bg-white text-red-600 shadow-xs font-bold" : "text-[#27351E]/70"
              }`}
            >
              Đang ẩn 👁️‍🗨️
            </button>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-[#E2DAC5] rounded-xl px-3 py-1.5 text-xs text-[#27351E] focus:outline-none"
          >
            <option value="all">Tất cả danh mục</option>
            {categories
              .filter((c) => c.slug !== "tat-ca")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#E2DAC5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F7F3E8] border-b border-[#E2DAC5] text-[#27351E]/70 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Sản phẩm</th>
                <th className="py-3 px-3">Danh mục</th>
                <th className="py-3 px-3 text-center">Nổi bật</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DAC5]/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-xs text-[#27351E]/60">
                    Đang tải danh sách sản phẩm...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <div className="inline-block bg-red-50 border border-red-200 rounded-xl px-6 py-4 text-left max-w-lg">
                      <p className="text-red-700 font-semibold text-sm mb-1">⚠️ Không thể kết nối Supabase</p>
                      <p className="text-red-600 text-xs">{loadError}</p>
                      <p className="text-gray-500 text-xs mt-2">Kiểm tra env vars trên Vercel: SUPABASE_SERVICE_ROLE_KEY</p>
                      <button
                        onClick={loadData}
                        className="mt-3 px-4 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                      >
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-xs text-[#27351E]/60">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.category_id);
                  return (
                    <tr key={p.id} className="hover:bg-black/2 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-cream-200 shrink-0 border border-[#E2DAC5]">
                          {p.thumbnail_url ? (
                            <Image
                              src={p.thumbnail_url}
                              alt={p.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">
                              🍃
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-[#27351E] line-clamp-1">
                            {p.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-[#27351E]/60 bg-cream-200 px-1.5 py-0.5 rounded-sm">
                              /go/{p.slug}
                            </span>
                            {p.shopee_url && (
                              <Link
                                href={p.shopee_url}
                                target="_blank"
                                className="text-[10px] text-[#EE4D2D] hover:underline flex items-center gap-0.5"
                              >
                                <span>Shopee</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-xs text-[#27351E]/80 whitespace-nowrap">
                        {cat?.name || "Khác"}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          title="Bật/tắt sản phẩm nổi bật"
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.is_featured
                              ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                              : "text-[#27351E]/30 hover:bg-black/5"
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleActive(p)}
                          title="Bật/tắt trạng thái hiển thị"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                            p.is_active
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {p.is_active ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Hiện</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Ẩn</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút Sửa sản phẩm */}
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-1.5 rounded-lg text-[#53683A] hover:bg-[#53683A]/10 transition-colors"
                            title="Sửa thông tin sản phẩm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Nút Test link /go/[slug] */}
                          <Link
                            href={`/go/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Mở link affiliate /go/[slug]"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Nút Xóa */}
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FFFDF7] rounded-2xl border border-[#E2DAC5] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2DAC5] pb-3">
              <h2 className="text-lg font-bold text-[#27351E] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#53683A]" />
                <span>Chỉnh sửa thông tin sản phẩm</span>
              </h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center text-[#27351E] hover:bg-cream-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#27351E] uppercase">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      title: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-sm text-[#27351E] focus:outline-none focus:border-[#53683A]"
                  required
                />
              </div>

              {/* Affiliate URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#EE4D2D] uppercase flex items-center gap-1">
                  <span>Link Shopee Affiliate *</span>
                </label>
                <input
                  type="url"
                  value={editingProduct.affiliate_url}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      affiliate_url: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-[#EE4D2D]/40 rounded-xl px-3 py-2 text-sm text-[#27351E] focus:outline-none focus:border-[#EE4D2D]"
                  required
                />
              </div>

              {/* Shopee URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#27351E] uppercase">
                  Link Shopee gốc
                </label>
                <input
                  type="url"
                  value={editingProduct.shopee_url || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      shopee_url: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#27351E] focus:outline-none focus:border-[#53683A]"
                />
              </div>

              {/* Thumbnail URL & Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#27351E] uppercase">
                  Ảnh sản phẩm (Thumbnail URL)
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cream-200 border border-[#E2DAC5] shrink-0">
                    {editingProduct.thumbnail_url ? (
                      <Image
                        src={editingProduct.thumbnail_url}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">
                        🍃
                      </div>
                    )}
                  </div>
                  <input
                    type="url"
                    value={editingProduct.thumbnail_url || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        thumbnail_url: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="flex-1 bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-xs text-[#27351E] focus:outline-none focus:border-[#53683A]"
                  />
                </div>
              </div>

              {/* Category & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#27351E] uppercase">
                    Danh mục
                  </label>
                  <select
                    value={editingProduct.category_id}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category_id: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-sm text-[#27351E] focus:outline-none focus:border-[#53683A]"
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

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#27351E] uppercase">
                    Thứ tự sắp xếp
                  </label>
                  <input
                    type="number"
                    value={editingProduct.sort_order}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        sort_order: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-sm text-[#27351E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_featured: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded-sm text-[#53683A]"
                  />
                  <span className="text-xs font-semibold text-[#27351E]">
                    Sản phẩm nổi bật ⭐
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_active}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_active: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded-sm text-[#53683A]"
                  />
                  <span className="text-xs font-semibold text-[#27351E]">
                    Đang hiển thị 👁️
                  </span>
                </label>
              </div>

              {/* Error display */}
              {editError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {editError}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2DAC5]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#27351E] hover:bg-cream-200"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="bg-[#53683A] hover:bg-[#44552f] text-white px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all active:scale-95"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Lưu thay đổi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
