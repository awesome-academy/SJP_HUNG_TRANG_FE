"use client";

import { ShoppingCart } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import CartItemRow from "@/components/cart/CartItemRow";
import CartSummary from "@/components/cart/CartSummary";
import { Link } from "@/i18n/navigation";

type CartPageProps = {
  locale: "vi" | "en";
  labels: {
    title: string;
    selectAll: string;
    clearCart: string;
    empty: string;
    continueShopping: string;
    item: {
      remove: string;
    };
    summary: {
      summary: string;
      selected: string;
      total: string;
      checkout: string;
      clearSelected: string;
      noItemSelected: string;
    };
  };
};

export default function CartPage({ locale, labels }: CartPageProps) {
  const { items, clearCart, toggleSelectAll } = useCartStore();
  const allSelected = items.length > 0 && items.every((item) => item.selected);
  const someSelected = items.some((item) => item.selected);

  if (items.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 text-zinc-300" strokeWidth={1.2} />
        <p className="text-lg font-medium text-zinc-500">{labels.empty}</p>
        <Link href="/products" locale={locale}>
          <Button className="bg-zinc-900 text-white hover:bg-zinc-700">
            {labels.continueShopping}
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full bg-[#f6f6f6] py-8 md:py-12">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900">{labels.title}</h1>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left — item list */}
          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-2">
            {/* Select all / Clear */}
            <div className="flex items-center justify-between border-b border-zinc-100 py-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-700">
                <Checkbox
                  checked={allSelected}
                  data-state={someSelected && !allSelected ? "indeterminate" : undefined}
                  onCheckedChange={toggleSelectAll}
                />
                {labels.selectAll}
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-zinc-400 hover:text-red-500"
                onClick={clearCart}
              >
                {labels.clearCart}
              </Button>
            </div>

            {/* Items */}
            <div>
              {items.map((item) => (
                <CartItemRow
                  key={item.product.id}
                  product={item.product}
                  quantity={item.quantity}
                  selected={item.selected}
                  locale={locale}
                  labels={labels.item}
                />
              ))}
            </div>
          </div>

          {/* Right — summary */}
          <CartSummary locale={locale} labels={labels.summary} />
        </div>
      </div>
    </main>
  );
}
