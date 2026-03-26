import ProductsCatalog from "@/components/products/ProductsCatalog";
import { getCatalogData } from "@/lib/catalog-server";

type ProductsPageProps = {
  params: Promise<{ locale: "vi" | "en" }>;
};

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;
  const { categories, products } = await getCatalogData();

  return <ProductsCatalog categories={categories} products={products} locale={locale} />;
}
