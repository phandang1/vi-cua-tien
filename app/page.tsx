import { getCategories, getProducts, getSiteSettings } from "@/lib/db";
import StorefrontClient from "@/components/StorefrontClient";

// Revalidate every 60 seconds (ISR) or on demand
export const revalidate = 60;

export default async function HomePage() {
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
