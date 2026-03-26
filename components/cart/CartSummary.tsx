"use client";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { formatPriceVnd } from "@/lib/mock-db";
import { useCartStore, useSelectedTotal, useSelectedCount } from "@/store/cart";

type CartSummaryProps = {
  locale: "vi" | "en";
  labels: {
    summary: string;
    selected: string;
    total: string;
    checkout: string;
    clearSelected: string;
    noItemSelected: string;
  };
};

export default function CartSummary({ locale, labels }: CartSummaryProps) {
  const router = useRouter();
  const { clearSelected } = useCartStore();
  const selectedTotal = useSelectedTotal();
  const selectedCount = useSelectedCount();

  function handleCheckout() {
    router.push("/checkout");
  }

  return (
    <div className="sticky top-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-zinc-900">{labels.summary}</h2>

      <div className="space-y-3 border-b border-zinc-100 pb-4">
        <div className="flex items-center justify-between text-sm text-zinc-600">
          <span>{labels.selected}</span>
          <span className="font-medium text-zinc-900">{selectedCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-zinc-600">
          <span>{labels.total}</span>
          <span className="text-base font-bold text-[#7faa3d]">
            {formatPriceVnd(selectedTotal, locale)}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Button
          className="h-10 w-full bg-zinc-900 text-white hover:bg-zinc-700"
          disabled={selectedCount === 0}
          onClick={handleCheckout}
        >
          {labels.checkout}
          {selectedCount > 0 ? ` (${selectedCount})` : ""}
        </Button>

        {selectedCount > 0 && (
          <Button
            variant="outline"
            className="h-10 w-full border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            onClick={clearSelected}
          >
            {labels.clearSelected}
          </Button>
        )}

        {selectedCount === 0 && (
          <p className="text-center text-xs text-zinc-400">{labels.noItemSelected}</p>
        )}
      </div>
    </div>
  );
}
