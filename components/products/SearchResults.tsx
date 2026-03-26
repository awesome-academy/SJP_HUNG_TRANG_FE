"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ProductCard from "@/components/products/ProductCard";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Product } from "@/lib/mock-db";

type SearchResultsProps = {
  locale: "vi" | "en";
  products: Product[];
  initialQuery: string;
  labels: {
    title: string;
    placeholder: string;
    searchingFor: string;
    emptyQuery: string;
    emptyResult: string;
  };
};

export default function SearchResults({ locale, products, initialQuery, labels }: SearchResultsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [keyword, setKeyword] = useState(initialQuery);
  const [debouncedKeyword, setDebouncedKeyword] = useState(initialQuery);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [keyword]);

  useEffect(() => {
    const query = debouncedKeyword.trim();
    const target = query.length > 0 ? `${pathname}?q=${encodeURIComponent(query)}` : pathname;
    router.replace(target);
  }, [debouncedKeyword, pathname, router]);

  const visibleProducts = useMemo(() => {
    const query = debouncedKeyword.toLocaleLowerCase(locale);
    if (query.length === 0) {
      return [];
    }

    return products.filter((product) => product.name.toLocaleLowerCase(locale).includes(query));
  }, [debouncedKeyword, locale, products]);

  const searchStatusText =
    debouncedKeyword.length > 0
      ? labels.searchingFor.replaceAll("{keyword}", debouncedKeyword)
      : labels.emptyQuery;

  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 py-8 lg:px-8">
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-5">
        <h1 className="text-[22px] font-bold text-zinc-900">{labels.title}</h1>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex h-10 w-full items-center gap-2 rounded-md border border-zinc-300 bg-white px-3">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={labels.placeholder}
              className="w-full border-none text-sm text-zinc-900 outline-none"
            />
          </div>
        </div>

        <p className="mt-3 text-zinc-600">{searchStatusText}</p>
      </div>

      {visibleProducts.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-zinc-600">
          {debouncedKeyword.length > 0 ? labels.emptyResult : labels.emptyQuery}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}
