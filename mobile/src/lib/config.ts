import Constants from "expo-constants";

type Extra = {
  /** User aggregate origin: `.env` `API_BASE_URL` + `USER_AGG_PORT`. */
  apiBaseUrl?: string;
  /** Mall aggregate origin: `API_BASE_URL` + `MALL_AGG_PORT`. */
  mallAggBaseUrl?: string;
  /** Thumbnail CDN base: `API_BASE_URL` + `SERV_FD_PORT` + `/api/cdn/2020-05-31/d/1`, or `MALL_CDN_BASE_URL` override. */
  mallCdnBaseUrl?: string;
  tokenRefreshIntervalMs?: number;
  features?: {
    commerce?: boolean;
    cart?: boolean;
    orders?: boolean;
  };
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const apiBaseUrl = (extra.apiBaseUrl ?? "").trim();

/** Mall aggregate origin (`API_BASE_URL` + `MALL_AGG_PORT`). Empty if unset. */
export const mallAggBaseUrl = (extra.mallAggBaseUrl ?? "").trim();

/** Mall product thumbnail CDN base (`API_BASE_URL` + `SERV_FD_PORT` + path, or `MALL_CDN_BASE_URL`). */
export const mallCdnBaseUrl = (extra.mallCdnBaseUrl ?? "").trim();

/** From `.env` `TOKEN_REFRESH_INTERVAL_MS` via `app.config.js`. Null disables periodic refresh. */
export const tokenRefreshIntervalMs: number | null = (() => {
  const n = extra.tokenRefreshIntervalMs;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
})();

export const features = {
  commerce: extra.features?.commerce !== false,
  cart: extra.features?.cart !== false,
  orders: extra.features?.orders !== false,
};
