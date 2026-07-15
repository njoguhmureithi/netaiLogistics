"use client";
import { create } from "zustand";

export interface RecentProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  categoryName: string;
}

interface RecentlyViewedState {
  products: RecentProduct[];
  addProduct: (product: RecentProduct) => void;
}

const MAX_ITEMS = 8;

export const useRecentlyViewedStore = create<RecentlyViewedState>((set) => ({
  products: [],
  addProduct: (product) => {
    set((state) => {
      const filtered = (state.products ?? []).filter((p) => p?.id !== product?.id);
      return { products: [product, ...filtered].slice(0, MAX_ITEMS) };
    });
  },
}));
