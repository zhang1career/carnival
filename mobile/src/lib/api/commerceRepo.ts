import type { FeedItem, Product } from "./types";

export type ProductPagination = {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
};

export type ProductListResult = {
  items: Product[];
  pagination: ProductPagination;
};

export type CommerceRepository = {
  listProducts: (params?: { page?: number; per_page?: number }) => Promise<ProductListResult>;
  getProduct: (id: string) => Promise<Product | null>;
  listFeed: () => Promise<FeedItem[]>;
};
