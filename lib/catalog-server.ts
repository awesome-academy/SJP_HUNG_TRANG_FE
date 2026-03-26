import "server-only";
import { apiGet } from "@/lib/json-server";
import type { Category, Product } from "@/lib/mock-db";

export async function getCatalogData() {
  const [products, categories] = await Promise.all([
    apiGet<Product[]>("/products"),
    apiGet<Category[]>("/categories"),
  ]);
  return { products, categories };
}
