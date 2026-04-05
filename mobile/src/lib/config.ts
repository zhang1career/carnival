import Constants from "expo-constants";

type Extra = {
  apiBaseUrl?: string;
  tokenRefreshIntervalMs?: number;
  features?: {
    commerce?: boolean;
    feed?: boolean;
    media?: boolean;
  };
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const apiBaseUrl = (extra.apiBaseUrl ?? "").trim();

/** From `.env` `TOKEN_REFRESH_INTERVAL_MS` via `app.config.js`. Null disables periodic refresh. */
export const tokenRefreshIntervalMs: number | null = (() => {
  const n = extra.tokenRefreshIntervalMs;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
})();

export const features = {
  commerce: extra.features?.commerce !== false,
  feed: extra.features?.feed !== false,
  media: extra.features?.media !== false,
};
