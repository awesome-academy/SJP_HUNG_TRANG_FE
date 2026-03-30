import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/mock-db";

export type CartItem = {
  product: Product;
  quantity: number;
  selected: boolean;
};

type CartStore = {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  toggleSelect: (productId: number) => void;
  toggleSelectAll: () => void;
  clearCart: () => void;
  clearSelected: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const items = get().items;
        const existing = items.find((item) => item.product.id === product.id);
        if (existing) {
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...items, { product, quantity: 1, selected: true }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      toggleSelect: (productId) => {
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, selected: !item.selected } : item
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
