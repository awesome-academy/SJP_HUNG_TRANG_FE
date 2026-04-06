"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Search, SlidersHorizontal, RefreshCw, Eye, Trash2,
  ChevronLeft, ChevronRight, PackageOpen, Plus, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard, SortButton } from "@/components/admin/products/ui";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { useDebounce } from "use-debounce";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { formatPriceVnd } from "@/lib/mock-db";

function StockBadge({ stock }: { stock: number }) {
  const t = useTranslations("Admin.products");
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        {t("outOfStock")}
      </span>
    );
  if (stock <= 5)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-600">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {t("lowStock")} ({stock})
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      {stock}
    </span>
  );
}

// Delete confirm 

function ConfirmDeleteDialog({
  product, onConfirm, onCancel,
}: {
  product: Product; onConfirm: () => void; onCancel: () => void;
}) {
  const t = useTranslations("Admin.products");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center">{t("deleteConfirmTitle")}</h3>
        <p className="text-sm text-gray-500 text-center mt-2">
          {t("areYouSure")} {" "}
          <span className="font-semibold text-gray-800">"{product.name}"</span>?
          {t("thisActionCannotBeUndone")}
        </p>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
          >
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Product list page

export default function ProductListPage() {
  const t = useTranslations("Admin.products");
  const locale = useLocale();
  const PAGE_SIZE = 5;

  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
  });

  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(pagination.total / PAGE_SIZE);

  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

  const [showFilters, setShowFilters] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);

  type SortOrder = "asc" | "desc";

  const [filters, setFilters] = useState<{
    q: string;
    name: string;
    categoryId: string;
    price_gte: string;
    price_lte: string;
    sort: string;
    order: SortOrder;
  }>({
    q: "",
    name: "",
    categoryId: "",
    price_gte: "",
    price_lte: "",
    sort: "createdAt",
    order: "desc",
  });

  const hasActiveFilters =
    filters.q ||
    filters.name ||
    filters.categoryId ||
    filters.price_gte ||
    filters.price_lte;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const [debouncedFilters] = useDebounce(filters, 300);


  const load = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        sort: filters.sort,
        order: filters.order,
      });

      if (filters.q) query.append("q", filters.q);
      if (filters.name) query.append("name", filters.name);
      if (filters.categoryId) query.append("categoryId", filters.categoryId);
      if (filters.price_gte) query.append("price_gte", filters.price_gte);
      if (filters.price_lte) query.append("price_lte", filters.price_lte);

      const res = await fetch(`/api/admin/products?${query.toString()}`);

      if (!res.ok) throw new Error("Fetch failed");

      const json = await res.json();

      setProducts(json.data);
      setPagination(json.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setFilters((f) => {
      if (f.q === debouncedSearch) return f;
      return { ...f, q: debouncedSearch };
    });
  }, [debouncedSearch]);

  useEffect(() => {
    load();
  }, [page, debouncedFilters]);

  const setFilter = (key: string, value: string) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const toggleSort = (field: string) => {
    setPage(1);
    setFilters((f) => ({
      ...f,
      sort: field,
      order:
        f.sort === field
          ? f.order === "asc"
            ? "desc"
            : "asc"
          : "asc",
    }));
  };

  const resetFilters = () => {
    setPage(1);
    setSearch("");
    setFilters({
      q: "",
      name: "",
      categoryId: "",
      price_gte: "",
      price_lte: "",
      sort: "createdAt",
      order: "desc",
    });
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        let errorMessage = "Failed to delete product.";
        const contentType = res.headers.get("content-type");
        try {
          if (contentType?.includes("application/json")) {
            const data = await res.json();
            if (typeof data?.message === "string" && data.message.trim()) {
              errorMessage = data.message;
            }
          } else {
            const text = await res.text();
            if (text.trim()) {
              errorMessage = text;
            }
          }
        } catch {
          // Ignore response parsing failures and use the default message.
        }
        throw new Error(errorMessage);
      }
      setDeletingProduct(null);
      load();
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-wide">
              {t("productManagement")}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {t("total")} <span className="font-semibold text-gray-700">{pagination.total}</span> {t("products")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={load}
              variant="outline"
              className="flex items-center gap-2 text-sm border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              {t("refresh")}
            </Button>
            <Button
              onClick={() => router.push("/admin/products/create")}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("addProduct")}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label={t("totalProducts")} value={pagination.total} sub={t("all")} />
          <StatCard label={t("current_page")} value={products.length} sub={`${t("page")} ${page}/${totalPages}`} />
          <StatCard label={t("outOfStock")} value={outOfStock} sub={t("thisPage")} />
          <StatCard label={t("lowStock")} value={lowStock} sub={t("lowStockDescription")} />
        </div>

        {/* Search + filter bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
              />
            </div>

            {/* Toggle advanced filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all",
                showFilters
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-400"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t("filters")}
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-green-500" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-sm text-red-400 hover:text-red-600 font-medium transition-colors"
              >
                <X className="w-3.5 h-3.5" /> {t("clear")}
              </button>
            )}
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                  {t("name")}
                </label>
                <input
                  type="text"
                  placeholder={t("filterByName")}
                  value={filters.name}
                  onChange={(e) => setFilter("name", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                  {t("Category ID")}
                </label>
                <input
                  type="number"
                  placeholder={t("filterByCategoryId")}
                  value={filters.categoryId}
                  onChange={(e) => setFilter("categoryId", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                  {t("priceFrom")}
                </label>
                <input
                  type="number"
                  placeholder={t("filterByPriceFrom")}
                  value={filters.price_gte}
                  onChange={(e) => setFilter("price_gte", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                  {t("priceTo")}
                </label>
                <input
                  type="number"
                  placeholder={t("filterByPriceTo")}
                  value={filters.price_lte}
                  onChange={(e) => setFilter("price_lte", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin text-green-500" />
              <span className="text-sm">{t("loading")}</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
              <PackageOpen className="w-10 h-10 text-gray-200" />
              <p className="text-sm">{t("noProductsFound")}</p>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="text-sm text-green-600 hover:underline">
                  {t("clearFilters")}
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">
                      {t("image")}
                    </th>
                    <th className="px-4 py-3 text-left">
                      <SortButton field="name" label={t("productName")} current={filters.sort} order={filters.order} onClick={toggleSort} />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <SortButton field="price" label={t("price")} current={filters.sort} order={filters.order} onClick={toggleSort} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("stock")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("category")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {t("type")}
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, idx) => (
                    <tr
                      key={product.id}
                      className={cn(
                        "border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors",
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      )}
                    >
                      {/* Thumbnail */}
                      <td className="px-4 py-3">
                        <div className="relative w-12 h-12 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center">
                          {product.mainImage?.url ? (
                            <Image
                              src={product.mainImage.url}
                              alt={product.name}
                              fill
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <PackageOpen className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 max-w-[240px]">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">#{product.id}</p>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">
                        {formatPriceVnd(product.price, locale)}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        <StockBadge stock={product.stock} />
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-mono">
                          #{product.categoryId}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-semibold",
                          product.hasVariants
                            ? "bg-violet-100 text-violet-700"
                            : "bg-gray-100 text-gray-500"
                        )}>
                          {product.hasVariants ? t("hasVariants") : t("simple")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => router.push(`/admin/products/${product.id}`)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 transition-colors font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" /> {t("view")}
                          </button>
                          <span className="text-gray-200">|</span>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> {t("delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.total > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                {t("showing")}{" "}
                <span className="font-semibold text-gray-800">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.total)}
                </span>{" "}
                {t("of")}{" "}
                <span className="font-semibold text-gray-800">{pagination.total}</span>{" "}
                {t("products")}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  if (totalPages === 0) return null;
                  let p: number;
                  if (totalPages <= 7) p = i + 1;
                  else if (page <= 4) p = i + 1;
                  else if (page >= totalPages - 3) p = totalPages - 6 + i;
                  else p = page - 3 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "w-8 h-8 rounded-lg border text-xs font-semibold transition-all",
                        page === p
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {deletingProduct && (
        <ConfirmDeleteDialog
          product={deletingProduct}
          onConfirm={() => handleDelete(deletingProduct.id)}
          onCancel={() => setDeletingProduct(null)}
        />
      )}
    </div>
  );
}
