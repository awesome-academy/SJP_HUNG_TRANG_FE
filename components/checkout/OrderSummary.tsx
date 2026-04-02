import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Tag,
  PartyPopper,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CartItem } from "@/store/cart";
import { Voucher } from "@/types/voucher";
import { SHIPPING_FEE } from "@/constants/shipping_fee";
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { formatPriceVnd } from "@/lib/mock-db";

// CartItemRow

function CartItemRow({
  item,
  locale,
}: {
  item: CartItem;
  locale: "vi" | "en";
}) {
  const t = useTranslations("Checkout.orderSummary");
  const mainImage =
    item.product?.images.find((img) => img.isMain)?.url ||
    item.product?.images[0]?.url;

  const unitPrice = item.product?.price || 0;
  const totalPrice = unitPrice * item.quantity;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-14 h-14 rounded-lg flex-shrink-0 relative overflow-hidden border border-gray-100 bg-gray-50">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={item.product?.name || "Product"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
            {t("No Image")}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
          {item.product?.name || t("Product not found")}
        </p>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-green-600">
            {formatPriceVnd(unitPrice, locale)}
          </span>
        </div>
      </div>

      {/* Quantity */}
      <div className="flex-shrink-0 text-right">
        <span className="text-xs text-gray-400 font-medium">
          x{item.quantity}
        </span>
        <p className="text-sm font-bold text-gray-900">
          {formatPriceVnd(totalPrice, locale)}
        </p>
      </div>
    </div>
  );
}

// PriceLine

function PriceLine({
  label,
  value,
  bold,
  highlight,
  strikethrough,
}: {
  label: React.ReactNode;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  strikethrough?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          "text-sm",
          bold ? "font-bold text-gray-900" : "text-gray-500",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-sm",
          bold ? "font-extrabold text-gray-900 text-base" : "",
          highlight ? "text-green-600 font-semibold" : "",
          strikethrough ? "line-through text-gray-400" : "",
        )}
      >
        {value}
      </span>
    </div>
  );
}

// OrderSummary

interface OrderSummaryProps {
  items: CartItem[];
  appliedVoucher: Voucher | null;
  locale: "vi" | "en";
}

export default function OrderSummary({
  items,
  appliedVoucher,
  locale,
}: OrderSummaryProps) {
  const t = useTranslations("Checkout.orderSummary");
  const [collapsed, setCollapsed] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.product.price || 0) * item.quantity;
  }, 0);

  const voucherDiscount = appliedVoucher
    ? Math.round((subtotal * appliedVoucher.discountPercent) / 100)
    : 0;

  const grandTotal = subtotal + SHIPPING_FEE - voucherDiscount;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-6">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-green-600" />
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            {t("Order")} ({items.reduce((s, i) => s + i.quantity, 0)}{" "}
            {t("products")})
          </h2>
        </div>
        {collapsed ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {!collapsed && (
        <div className="px-5 pb-2">
          <Separator className="mb-1" />
          {items.map((item) => (
            <CartItemRow key={`${item.lineId}`} item={item} locale={locale} />
          ))}
        </div>
      )}

      {/* Pricing */}
      <div className="px-5 py-4 space-y-2.5 bg-gray-50 border-t border-gray-100">
        <PriceLine
          label={t("Subtotal")}
          value={`${formatPriceVnd(subtotal, locale)}`}
          strikethrough={voucherDiscount > 0}
        />
        <PriceLine
          label={t("Shipping Fee")}
          value={`+${formatPriceVnd(SHIPPING_FEE, locale)}`}
        />
        {appliedVoucher && (
          <PriceLine
            label={
              <span className="flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-green-500" />
                {t("Voucher")}{" "}
                <span className="font-mono text-green-600 font-bold">
                  {appliedVoucher.code}
                </span>
              </span>
            }
            value={`-${formatPriceVnd(voucherDiscount, locale)}`}
            highlight
          />
        )}

        <Separator />

        <PriceLine
          label={t("Total")}
          value={`${formatPriceVnd(grandTotal, locale)}`}
          bold
        />

        {voucherDiscount > 0 && (
          <p className="flex items-center justify-end gap-1 text-xs text-green-600 font-medium text-right">
            {t("You saved")} {formatPriceVnd(voucherDiscount, locale)}{" "}
            <PartyPopper size={14} />
          </p>
        )}
      </div>
    </div>
  );
}
