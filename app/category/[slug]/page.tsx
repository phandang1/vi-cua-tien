import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategories, getProducts, getSiteSettings } from "@/lib/db";
import StorefrontClient from "@/components/StorefrontClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return {
      title: "Danh mục sản phẩm — Vị Của Tiên",
    };
  }

  return {
    title: `${category.name} — Vị Của Tiên`,
    description:
      category.description ||
      `Khám phá các sản phẩm ${category.name} chất lượng cao tại Vị Của Tiên.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [categories, products, settings] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: slug }),
    getSiteSettings(),
  ]);

  const categoryExists =
    slug === "tat-ca" || categories.some((c) => c.slug === slug);

  if (!categoryExists) {
    notFound();
  }

  return (
    <main>
      <StorefrontClient
        categories={categories}
        initialProducts={products}
        settings={settings}
        defaultCategorySlug={slug}
      />
    </main>
  );
}
