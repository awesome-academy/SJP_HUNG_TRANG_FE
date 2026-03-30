"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/lib/mock-db";

type AddToCartButtonProps = {
  product: Product;
  labels: {
    add: string;
    added: string;
    outOfStock: string;
  };
};

export default function AddToCartButton({ product, labels }: AddToCartButtonProps) {
  const { addItem } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  if (product.stock === 0) {
    return (
      <Button disabled className="h-11 w-full">
        {labels.outOfStock}
      </Button>
    );
  }

  return (
    <Button
      className="h-11 w-full bg-zinc-900 text-white hover:bg-zinc-700"
      onClick={handleAdd}
      disabled={justAdded}
    >
      {justAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          {labels.added}
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
