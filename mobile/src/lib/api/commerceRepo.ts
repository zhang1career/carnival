import type { FeedItem, Product } from "./types";

export type CommerceRepository = {
  listProducts: () => Promise<Product[]>;
  getProduct: (id: string) => Promise<Product | null>;
  listFeed: () => Promise<FeedItem[]>;
};
