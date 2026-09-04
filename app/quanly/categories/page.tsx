"use client";

import { useState, useEffect } from "react";
import {
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Leaf,
  Utensils,
  Coffee,
  Soup,
  CookingPot,
  LayoutGrid,
} from "lucide-react";
import { Category } from "@/types/database";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Category Form
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("leaf");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          icon,
          description: description.trim(),
          sort_order: Number(sortOrder) || categories.length,
          is_active: true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setName("");
        setSlug("");
        setDescription("");
        setIsAdding(false);
        loadCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      const updated = { ...cat, is_active: !cat.is_active };
      setCategories(categories.map((c) => (c.id === cat.id ? updated : c)));
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error(err);
      loadCategories();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      setCategories(categories.filter((c) => c.id !== id));
      await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      loadCategories();
    }
  };

  const iconOptions = [
    { label: "Lá cây (Leaf)", value: "leaf" },
    { label: "Đồ ăn (Utensils)", value: "utensils" },
    { label: "Đồ uống (Coffee)", value: "coffee" },
    { label: "Gia vị (Soup)", value: "soup" },
    { label: "Đồ bếp (Cooking Pot)", value: "cooking-pot" },
    { label: "Khác (Grid)", value: "grid" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#27351E]">
            Quản lý Danh mục ({categories.length})
          </h1>
          <p className="text-xs text-[#27351E]/70">
            Cấu hình các nhóm sản phẩm ẩm thực hiển thị trên thanh điều hướng trang chủ.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 bg-[#53683A] hover:bg-[#44552f] text-white px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-sm transition-all active:scale-95 shrink-0"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? "Đóng form" : "Thêm danh mục mới"}</span>
        </button>
      </div>

      {/* Add Category Form Drawer */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-[#FFFDF7] p-6 rounded-2xl border border-[#53683A]/30 shadow-md space-y-4"
        >
          <h3 className="font-serif text-lg font-bold text-[#27351E]">
            Thêm danh mục ẩm thực mới
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#27351E]">Tên danh mục *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Trà thảo mộc & Mật ong"
                className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#27351E] focus:outline-none focus:border-[#53683A]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#27351E]">Slug (Đường dẫn tĩnh)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="vd: tra-thao-moc (để trống tự tạo)"
                className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#27351E] focus:outline-none focus:border-[#53683A]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#27351E]">Biểu tượng (Icon)</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#27351E] focus:outline-none focus:border-[#53683A]"
              >
                {iconOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#27351E]">Thứ tự sắp xếp</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#27351E]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#27351E]">Mô tả ngắn</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Trà thảo dược giải nhiệt tự nhiên..."
              className="w-full bg-white border border-[#E2DAC5] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#27351E]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs text-[#27351E] hover:bg-cream-200 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-[#53683A] text-white px-5 py-2 text-xs font-medium rounded-xl hover:bg-[#44552f]"
            >
              Lưu danh mục
            </button>
          </div>
        </form>
      )}

      {/* Category List */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#E2DAC5] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-[#F7F3E8] border-b border-[#E2DAC5] text-[#27351E]/70 uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Danh mục</th>
              <th className="py-3 px-3">Slug</th>
              <th className="py-3 px-3 text-center">Thứ tự</th>
              <th className="py-3 px-3 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-right">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2DAC5]/50">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-black/2 transition-colors">
                <td className="py-3 px-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cream-200 border border-[#E2DAC5] flex items-center justify-center text-[#53683A] shrink-0">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#27351E] block">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-[#27351E]/60 line-clamp-1">
                      {cat.description || "Không có mô tả"}
                    </span>
                  </div>
                </td>

                <td className="py-3 px-3 text-xs text-[#27351E]/70 font-mono">
                  {cat.slug}
                </td>

                <td className="py-3 px-3 text-center font-medium text-[#53683A]">
                  {cat.sort_order}
                </td>

                <td className="py-3 px-3 text-center">
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                      cat.is_active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {cat.is_active ? "Đang hiện" : "Đang ẩn"}
                  </button>
                </td>

                <td className="py-3 px-4 text-right">
                  {cat.slug !== "tat-ca" && (
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa danh mục"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
