"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Search,
  RefreshCw,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  X,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_META, SortableHeader, StatusBadge, StatCard } from "@/components/admin/orders/ui";
import { cn } from "@/lib/utils";
import { Order } from "@/types/order";
import { ORDER_STATUS } from "@/constants/order_status";
import { useLocale, useTranslations } from "next-intl";
import { useDebounce } from "use-debounce";
import { formatPriceVnd } from "@/lib/mock-db";

const PAGE_SIZE = 10;

function ConfirmDeleteDialog({
  order,
  onConfirm,
  onCancel,
}: {
  order: Order;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("Admin.orders");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center">
          {t("delete_confirm_title")}
        </h3>
        <p className="text-sm text-gray-500 text-center mt-2">
          {t("delete_confirm_message")}{" "}
          <span className="font-semibold text-gray-800">#{order.id}</span> {t("of")}{" "}
          <span className="font-semibold text-gray-800">{order.fullName}</span>?
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


export default function OrderListPage() {
  const t = useTranslations("Admin.orders");
  const locale = useLocale();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const [debouncedSearch] = useDebounce(searchTerm, 400);

  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        sort: sortBy,
        order: order,
      });
      if (status && status !== "ALL") params.append("status", status);
      if (debouncedSearch.trim()) params.append("q", debouncedSearch.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setOrders(json.data);
      setTotal(json.pagination?.total || 0);
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [page, status, debouncedSearch, sortBy, order]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch, sortBy, order]);

  const pendingCount = orders.filter(
    (o) => o.status === ORDER_STATUS.PENDING,
  ).length;
  const deliveredCount = orders.filter(
    (o) => o.status === ORDER_STATUS.DELIVERED,
  ).length;
  const cancelledCount = orders.filter(
    (o) => o.status === ORDER_STATUS.CANCELLED,
  ).length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("desc");
    }
    setPage(1);
  };

  const handleStatusFilter = (s: string) => setStatus(s);

  const handleDelete = async () => {
    if (!deletingOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${deletingOrder.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error();
      load();
    } catch {
      console.error("Failed to delete order");
    } finally {
      setDeletingOrder(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-wide">
              {t("orders_management")}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {t("total")}
              <span className="font-semibold text-gray-700">{total}</span>
              {t("orders")}
            </p>
          </div>
          <Button
            onClick={load}
            variant="outline"
            className="flex items-center gap-2 text-sm border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600"
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5", loading && "animate-spin")}
            />
            {t("refresh")}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label={t("total_orders")} value={total} />
          <StatCard
            label={t("PENDING")}
            value={pendingCount}
            color="text-amber-600"
          />
          <StatCard
            label={t("DELIVERED")}
            value={deliveredCount}
            color="text-green-600"
          />
          <StatCard
            label={t("CANCELLED")}
            value={cancelledCount}
            color="text-red-500"
          />
        </div>

        {/* Search + status filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("search_orders")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
            />
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => handleStatusFilter("")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                status === ""
                  ? "bg-gray-800 text-white border-gray-800"
                  : "border-gray-200 text-gray-500 hover:border-gray-400",
              )}
            >
              {t("all_orders")}
            </button>
            <Filter className="w-3.5 h-3.5 text-gray-400 mr-1" />
            {Object.values(ORDER_STATUS).map((s) => {
              const meta =
                ORDER_STATUS_META[s as keyof typeof ORDER_STATUS_META];
              const active = status === s;
              return (
                <button
                  key={s}
                  onClick={() => handleStatusFilter(s)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                    active
                      ? `${meta.bg} ${meta.color} border-current`
                      : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700",
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot)} />
                  {t(s)}
                </button>
              );
            })}
            {(debouncedSearch || status !== "") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatus("");
                }}
                className="flex items-center gap-1 ml-auto text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                <X className="w-3 h-3" /> {t("clear_filters")}
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin text-green-500" />
              <span className="text-sm">{t("loading")}</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
              <ShoppingBag className="w-10 h-10 text-gray-200" />
              <p className="text-sm">{t("no_orders_found")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <SortableHeader
                      label={t("id")}
                      field="id"
                      currentSort={sortBy}
                      currentOrder={order}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label={t("customer")}
                      field="fullName"
                      currentSort={sortBy}
                      currentOrder={order}
                      onSort={handleSort}
                    />
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {t("products")}
                    </th>
                    <SortableHeader
                      label={t("total_price")}
                      field="totalPrice"
                      currentSort={sortBy}
                      currentOrder={order}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label={t("status")}
                      field="status"
                      currentSort={sortBy}
                      currentOrder={order}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label={t("order_date")}
                      field="createdAt"
                      currentSort={sortBy}
                      currentOrder={order}
                      onSort={handleSort}
                    />
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr
                      key={order.id}
                      className={cn(
                        "border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors",
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/30",
                      )}
                    >
                      {/* ID */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-gray-800 font-mono">
                          #{order.id}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                          {order.fullName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.phone}
                        </p>
                      </td>

                      {/* Items summary */}
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600">
                          {order.items.length} {t("products")}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 max-w-[180px] truncate">
                          {order.items.map((i) => i.productName).join(", ")}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                          {formatPriceVnd(order.totalPrice, locale)}
                        </p>
                        {order.voucherCode && (
                          <p className="text-xs text-green-600 mt-0.5">
                            🎫 {order.voucherCode}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        { new Date(order.createdAt).toLocaleDateString(locale) }
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() =>
                              router.push(`/admin/orders/${order.id}`)
                            }
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 transition-colors font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" /> {t("view")}
                          </button>
                          <span className="text-gray-200">|</span>
                          <button
                            onClick={() => setDeletingOrder(order)}
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
          {!loading && total > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                {t("pagination.showing", {
                  from: (page - 1) * PAGE_SIZE + 1,
                  to: Math.min(page * PAGE_SIZE, total),
                  total,
                })}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "w-8 h-8 rounded-lg border text-xs font-semibold transition-all",
                        page === p
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600",
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}
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

      {deletingOrder && (
        <ConfirmDeleteDialog
          order={deletingOrder}
          onConfirm={handleDelete}
          onCancel={() => setDeletingOrder(null)}
        />
      )}
    </div>
  );
}
