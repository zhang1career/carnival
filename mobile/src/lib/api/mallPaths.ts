export const MALL_PRODUCTS_PATH = "/api/mall/products";

export function mallProductPath(id: number): string {
  return `/api/mall/products/${id}`;
}

export const MALL_ORDERS_PATH = "/api/mall/orders";

export function mallOrderPath(id: number): string {
  return `/api/mall/orders/${id}`;
}
