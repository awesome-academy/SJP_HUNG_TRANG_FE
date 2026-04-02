"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import type { CartProduct } from "@/types/cart";
import type { CartItemVariant } from "@/store/cart";

type AddToCartButtonProps = {
  product: CartProduct;
  labels: {
    add: string;
    added?: string;
    outOfStock: string;
  };
  quantity?: number;
  variant?: CartItemVariant;
  className?: string;
  disabled?: boolean;
};

export default function AddToCartButton({
  product,
  labels,
  quantity = 1,
  variant,
  className,
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addItem(product as CartProduct, { quantity, variant });
    setJustAdded(true);
  }

  useEffect(() => {
    if (!justAdded) return;

    const timeout = setTimeout(() => {
      setJustAdded(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [justAdded]);

  const availableStock = variant?.stock ?? product.stock;

  if (availableStock === 0 || disabled) {
    return (
      <Button disabled className={cn("h-11 w-full", className)}>
        {labels.outOfStock}
      </Button>
    );
  }

  return (
    <Button
      className={cn("h-11 w-full bg-zinc-900 text-white hover:bg-zinc-700", className)}
      onClick={handleAdd}
      disabled={justAdded}
    >
      {justAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          {labels.added ?? labels.add}
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {labels.add}
        </>
      )}
    </Button>
  );
}
