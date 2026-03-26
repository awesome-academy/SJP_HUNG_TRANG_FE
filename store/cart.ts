import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartProduct } from "@/types/cart"; // ← thay vì import Product from mock-db

export type CartItemVariant = {
  id?: string | number;
  color?: string;
  size?: string;
  stock: number;
};

export type CartItem = {
  lineId: string;
  product: CartProduct;
  variant?: CartItemVariant;
  quantity: number;
  selected: boolean;
};

type AddItemOptions = {
  quantity?: number;
  variant?: CartItemVariant;
};

type CartStore = {
  items: CartItem[];
  addItem: (product: CartProduct, options?: AddItemOptions) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  toggleSelect: (lineId: string) => void;
  toggleSelectAll: () => void;
  clearCart: () => void;
  clearSelected: () => void;
};

function getLineId(productId: string | number, variant?: CartItemVariant): string {
  if (!variant) {
    return `${productId}::default`;
  }
  const variantKey = variant.id ?? `${variant.color ?? ""}:${variant.size ?? ""}`;
  return `${productId}::${variantKey}`;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, options) => {
        const items = get().items;
        const lineId = getLineId(product.id, options?.variant);
        const quantityToAdd = options?.quantity ?? 1;

        if (quantityToAdd < 1) {
          return;
        }

        const maxStock = options?.variant?.stock ?? product.stock;
        const existing = items.find((item) => item.lineId === lineId);

        if (existing) {
          set({
            items: items.map((item) =>
              item.lineId === lineId
                ? { ...item, quantity: Math.min(item.quantity + quantityToAdd, maxStock) }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                lineId,
                product,
                variant: options?.variant,
                quantity: Math.min(quantityToAdd, maxStock),
                selected: true,
              },
            ],
          });
        }
      },

      removeItem: (lineId) => {
        set({ items: get().items.filter((item) => item.lineId !== lineId) });
      },

      updateQuantity: (lineId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.lineId === lineId
              ? { ...item, quantity: Math.min(quantity, item.variant?.stock ?? item.product.stock) }
              : item
          ),
        });
      },

      toggleSelect: (lineId) => {
        set({
          items: get().items.map((item) =>
            item.lineId === lineId ? { ...item, selected: !item.selected } : item
          ),
        });
      },

      toggleSelectAll: () => {
        const allSelected = get().items.every((item) => item.selected);
        set({ items: get().items.map((item) => ({ ...item, selected: !allSelected })) });
      },

      clearCart: () => set({ items: [] }),

      clearSelected: () => {
        set({ items: get().items.filter((item) => !item.selected) });
      },
    }),
    { name: "cart-storage" }
  )
);

export function useCartCount() {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
}

export function useSelectedTotal() {
  return useCartStore((state) =>
    state.items
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );
}

export function useSelectedCount() {
  return useCartStore((state) => state.items.filter((item) => item.selected).length);
}
