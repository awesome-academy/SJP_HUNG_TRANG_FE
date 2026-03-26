import { getTranslations } from "next-intl/server";

import SearchResults from "@/components/products/SearchResults";
import { getCatalogData } from "@/lib/catalog-server";

type SearchPageProps = {
  params: Promise<{ locale: "vi" | "en" }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: "SearchPage" });
  const { products } = await getCatalogData();

  const query = resolvedSearchParams.q;
  const initialQuery = (Array.isArray(query) ? (query[0] ?? "") : (query ?? "")).trim();
  
  return (
    <SearchResults
      locale={locale}
      products={products}
      initialQuery={initialQuery}
      labels={{
        title: t("title"),
        placeholder: t("placeholder"),
        searchingFor: t("searchingFor", { keyword: initialQuery }),
        emptyQuery: t("emptyQuery"),
        emptyResult: t("emptyResult"),
      }}
    />
  );
}
