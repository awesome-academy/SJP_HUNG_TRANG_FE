"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import {
  RefreshCw,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  FileText,
  Tag,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_META,
  StatusBadge,
  SectionCard,
  InfoRow,
} from "@/components/admin/orders/ui";
import { OrderStatus } from "@/constants/order_status";
import { Order } from "@/types/order";
import { useLocale, useTranslations } from "next-intl";
import { formatPriceVnd } from "@/lib/mock-db";

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

//Status timeline

const TIMELINE: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
];

function StatusTimeline({ current }: { current: OrderStatus }) {
  const t = useTranslations("Admin.orders_details");
  if (current === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 px-1 py-2">
        <span className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-red-500">
          {t("order_cancelled")}
        </span>
      </div>
    );
  }

  const currentIdx = TIMELINE.indexOf(current);

  return (
    <div className="flex items-center gap-0 w-full">
      {TIMELINE.map((s, i) => {
        const done = i <= currentIdx;
        const m = ORDER_STATUS_META[s];
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                  done
                    ? `${m.dot} border-transparent`
                    : "border-gray-200 bg-white",
                )}
              >
                {done && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold whitespace-nowrap",
                  done ? m.color : "text-gray-300",
                )}
              >
                {t(s)}
              </span>
            </div>
            {i < TIMELINE.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 mb-4 transition-all",
                  i < currentIdx ? "bg-green-400" : "bg-gray-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Order details

export default function OrderDetailsPage() {
  const t = useTranslations("Admin.orders_details");
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
 
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) throw new Error();
      setOrder(await res.json());
    } catch {
      console.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      const updated: Order = await res.json();
      setOrder(updated);
    } catch {
      console.error("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin text-green-500" />
          <span className="text-sm">{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto" />
          <p className="text-sm text-gray-500">{t("order_not_found")}</p>
          <button
            onClick={() => router.push("/admin/orders")}
            className="text-sm text-green-600 hover:underline"
          >
            {t("back_to_list")}
          </button>
        </div>
      </div>
    );
  }

  const allowedTransitions = STATUS_TRANSITIONS[order.status];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Top bar: status + date + actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={order.status} />
            <span className="text-xs text-gray-400">
              {t("placed_at")} {new Date(order.createdAt).toLocaleDateString(locale)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={load}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 text-xs border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600"
            >
              <RefreshCw className="w-3 h-3" /> {t("refresh")}
            </Button>
          </div>
        </div>

        {/* Status timeline */}
        <SectionCard
          title={t("status_timeline")}
          icon={<Package className="w-4 h-4" />}
        >
          <StatusTimeline current={order.status} />

          {/* Status update buttons */}
          {allowedTransitions.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                {t("update_status")}
              </p>
              <div className="flex gap-2 flex-wrap">
                {allowedTransitions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={updatingStatus}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                      s === "CANCELLED"
                        ? "border-red-200 text-red-500 hover:bg-red-50"
                        : "border-green-200 text-green-700 hover:bg-green-50",
                    )}
                  >
                    {updatingStatus ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          ORDER_STATUS_META[s].dot,
                        )}
                      />
                    )}
                    {t(s)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: customer info */}
          <div className="space-y-4">
            <SectionCard
              title={t("customer_info")}
              icon={<User className="w-4 h-4" />}
            >
              <InfoRow
                icon={<User className="w-4 h-4" />}
                label={t("full_name")}
                value={order.fullName}
              />
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label={t("phone")}
                value={order.phone}
              />
              <InfoRow
                icon={<MapPin className="w-4 h-4" />}
                label={t("shipping_address")}
                value={order.address}
              />
              <InfoRow
                icon={<FileText className="w-4 h-4" />}
                label={t("notes")}
                value={order.note || t("no_notes")}
              />
              {order.voucherCode && (
                <InfoRow
                  icon={<Tag className="w-4 h-4" />}
                  label={t("voucher_code")}
                  value={order.voucherCode}
                />
              )}
              <InfoRow
                icon={<User className="w-4 h-4" />}
                label={t("user_id")}
                value={`#${order.userId}`}
              />
            </SectionCard>

            {/* Order summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                {t("order_summary")}
              </h3>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {order.items.length} {t("items")}
                </span>
                <span className="text-gray-700 font-medium">
                  {formatPriceVnd(
                    order.items.reduce((s, i) => s + i.price * i.quantity, 0),
                    locale
                  )}
                </span>
              </div>
              {order.voucherCode && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">
                    {t("voucher")}: {order.voucherCode}
                  </span>
                  <span className="text-green-600 font-medium">—</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm font-bold text-gray-800">
                  {t("total")}
                </span>
                <span className="text-lg font-extrabold text-gray-900">
                  {formatPriceVnd(order.totalPrice, locale)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: items */}
          <div className="lg:col-span-2">
            <SectionCard
              title={`${t("items")} (${order.items.length})`}
              icon={<ShoppingBag className="w-4 h-4" />}
            >
              <div className="space-y-0">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0"
                  >
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t("product_id")} #{item.productId}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatPriceVnd(item.price, locale)} × {item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {formatPriceVnd(item.price * item.quantity, locale)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        x{item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
