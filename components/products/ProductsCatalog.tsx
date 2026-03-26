"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import CategoryTreeFilter from "@/components/products/CategoryTreeFilter";
import ProductCard from "@/components/products/ProductCard";
import type { Category, Product } from "@/lib/mock-db";

type ProductsCatalogProps = {
  products: Product[];
  categories: Category[];
  locale: "vi" | "en";
};

export default function ProductsCatalog({ products, categories, locale }: ProductsCatalogProps) {
  const t = useTranslations("ProductsPage");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const visibleProducts = useMemo(() => {
    if (selectedCategoryId === null) {
      return products;
    }

    const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
    if (!selectedCategory) {
      return products;
    }

    const childrenByParentId = new Map<number, number[]>();
    for (const category of categories) {
      if (category.parentId === null) {
        continue;
      }

      const children = childrenByParentId.get(category.parentId) ?? [];
      children.push(category.id);
      childrenByParentId.set(category.parentId, children);
    }

    const visibleCategoryIds = new Set<number>([selectedCategory.id]);
    const stack = [selectedCategory.id];

    while (stack.length > 0) {
      const currentCategoryId = stack.pop();
      if (currentCategoryId === undefined) {
        break;
      }

      const childIds = childrenByParentId.get(currentCategoryId) ?? [];
      for (const childId of childIds) {
        if (visibleCategoryIds.has(childId)) {
          continue;
        }

        visibleCategoryIds.add(childId);
        stack.push(childId);
      }
    }

    return products.filter((product) => visibleCategoryIds.has(product.categoryId));
  }, [categories, products, selectedCategoryId]);

  return (
    <section className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[280px_1fr] lg:px-8">
      <CategoryTreeFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        locale={locale}
      />

      <div>
        {visibleProducts.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-zinc-600">
            {t("empty")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
