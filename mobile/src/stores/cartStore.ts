import { create } from "zustand";
import type { Product } from "@/lib/api/types";

export type CartLine = {
  productId: string;
  title: string;
  priceCents: number;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  add: (product: Product, qty?: number) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  add: (product, qty = 1) => {
    const { lines } = get();
    const i = lines.findIndex((l) => l.productId === product.id);
    if (i >= 0) {
      const next = [...lines];
      next[i] = { ...next[i], qty: next[i].qty + qty };
      set({ lines: next });
      return;
    }
    set({
      lines: [
        ...lines,
        {
          productId: product.id,
          title: product.title,
          priceCents: product.priceCents,
          qty,
        },
      ],
    });
  },
  removeLine: (productId) =>
    set({ lines: get().lines.filter((l) => l.productId !== productId) }),
  clear: () => set({ lines: [] }),
}));

export function cartTotalCents(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.priceCents * l.qty, 0);
}
