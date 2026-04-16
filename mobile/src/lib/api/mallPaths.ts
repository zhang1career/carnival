export const MALL_PRODUCTS_PATH = "/api/mall/products";

/** POST body must match backend `ProductSearchRequest` (forwarded to SearchRec). */
export const MALL_PRODUCTS_SEARCH_PATH = "/api/mall/products/search";

export function mallProductPath(id: number): string {
  return `/api/mall/products/${id}`;
}

export const MALL_ORDERS_PATH = "/api/mall/orders";

export function mallOrderPath(id: number): string {
  return `/api/mall/orders/${id}`;
}
