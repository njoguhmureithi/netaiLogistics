"use client";
import { create } from "zustand";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  stockQuantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item, qty = 1) => {
    set((state) => {
      const existing = state.items?.find((i: CartItem) => i?.id === item?.id);
      if (existing) {
        return {
          items: (state.items ?? []).map((i: CartItem) =>
            i?.id === item?.id
              ? { ...i, quantity: Math.min((i?.quantity ?? 0) + qty, i?.stockQuantity ?? 99) }
              : i
          ),
        };
      }
      return { items: [...(state.items ?? []), { ...(item ?? {}), quantity: qty } as CartItem] };
    });
  },
  removeItem: (id) => {
    set((state) => ({ items: (state.items ?? []).filter((i: CartItem) => i?.id !== id) }));
  },
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      set((state) => ({ items: (state.items ?? []).filter((i: CartItem) => i?.id !== id) }));
      return;
    }
    set((state) => ({
      items: (state.items ?? []).map((i: CartItem) =>
        i?.id === id ? { ...i, quantity: Math.min(quantity, i?.stockQuantity ?? 99) } : i
      ),
    }));
  },
  clearCart: () => set({ items: [] }),
  getTotalItems: () => (get().items ?? []).reduce((t: number, i: CartItem) => t + (i?.quantity ?? 0), 0),
  getTotalPrice: () =>
    (get().items ?? []).reduce((t: number, i: CartItem) => t + (i?.price ?? 0) * (i?.quantity ?? 0), 0),
}));
