import { getCategories, getProducts, getSiteSettings } from "@/lib/db";
import StorefrontClient from "@/components/StorefrontClient";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [categories, products, settings] = await Promise.all([
    getCategories(),
    getProducts(),
    getSiteSettings(),
  ]);

  return (
    <main>
      <StorefrontClient
        categories={categories}
        initialProducts={products}
        settings={settings}
      />
    </main>
  );
}
