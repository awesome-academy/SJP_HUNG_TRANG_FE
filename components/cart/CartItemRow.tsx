"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { formatPriceVnd, getMainImage, type Product } from "@/lib/mock-db";
import { useCartStore } from "@/store/cart";

type CartItemRowProps = {
  product: Product;
  quantity: number;
  selected: boolean;
  locale: "vi" | "en";
  labels: {
    remove: string;
  };
};

export default function CartItemRow({
  product,
  quantity,
  selected,
  locale,
  labels,
}: CartItemRowProps) {
  const { removeItem, updateQuantity, toggleSelect } = useCartStore();

  return (
    <div className="flex items-center gap-3 border-b border-zinc-100 py-4 last:border-0 sm:gap-4">
      <Checkbox
        checked={selected}
        onCheckedChange={() => toggleSelect(product.id)}
        className="mt-1 shrink-0"
      />

      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:h-24 sm:w-24">
        <Image
          src={getMainImage(product.images)}
          alt={product.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <p className="line-clamp-2 text-sm font-medium text-zinc-900">{product.name}</p>
        <p className="text-sm font-bold text-[#7faa3d]">
          {formatPriceVnd(product.price, locale)}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-zinc-600 hover:bg-zinc-100"
              onClick={() => updateQuantity(product.id, quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-7 text-center text-sm font-medium text-zinc-900">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-zinc-600 hover:bg-zinc-100"
              onClick={() => updateQuantity(product.id, quantity + 1)}
              disabled={quantity >= product.stock}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <p className="text-sm font-semibold text-zinc-700">
            {formatPriceVnd(product.price * quantity, locale)}
          </p>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-zinc-400 hover:text-red-500"
            onClick={() => removeItem(product.id)}
            aria-label={labels.remove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
