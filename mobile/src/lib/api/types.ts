export type Product = {
  id: string;
  title: string;
  priceCents: number;
  imageUrl: string;
  description: string;
};

export type FeedItem = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};
