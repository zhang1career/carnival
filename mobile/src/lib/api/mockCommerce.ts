import type { CommerceRepository } from "./commerceRepo";
import type { FeedItem, Product } from "./types";

const products: Product[] = [
  {
    id: "1",
    title: "Studio Headphones",
    priceCents: 19900,
    imageUrl: "https://picsum.photos/seed/p1/400/400",
    description: "Closed-back, comfortable for long sessions.",
  },
  {
    id: "2",
    title: "Mechanical Keyboard",
    priceCents: 14900,
    imageUrl: "https://picsum.photos/seed/p2/400/400",
    description: "Hot-swappable switches, compact 75% layout.",
  },
  {
    id: "3",
    title: "USB-C Hub",
    priceCents: 5900,
    imageUrl: "https://picsum.photos/seed/p3/400/400",
    description: "HDMI, SD, and three USB-A ports.",
  },
];

const feed: FeedItem[] = [
  {
    id: "f1",
    author: "River",
    body: "Shipped a new feed layout with pull-to-refresh.",
    createdAt: "2026-04-01T10:00:00Z",
  },
  {
    id: "f2",
    author: "Morgan",
    body: "Mock data only — swap `getCommerceRepo()` for HTTP.",
    createdAt: "2026-04-02T14:30:00Z",
  },
];

function delay<T>(value: T, ms = 280): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const mockCommerceRepository: CommerceRepository = {
  async listProducts() {
    return delay([...products]);
  },
  async getProduct(id: string) {
    return delay(products.find((p) => p.id === id) ?? null);
  },
  async listFeed() {
    return delay([...feed]);
  },
};
