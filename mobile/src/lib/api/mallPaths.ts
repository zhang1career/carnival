/** Mall-agg product routes via API gateway (`API_GATEWAY_PORT`). */
export const MALL_PRODUCTS_PATH = "/api/mall-agg/product";

/** POST body must match backend `ProductSearchRequest` (forwarded to SearchRec). */
export const MALL_PRODUCTS_SEARCH_PATH = "/api/mall-agg/product/search";

export function mallProductPath(id: number): string {
  return `/api/mall-agg/product/${id}`;
}

export const MALL_ORDERS_PATH = "/api/mall/orders";

export function mallOrderPath(id: number): string {
  return `/api/mall/orders/${id}`;
}
