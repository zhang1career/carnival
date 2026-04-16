import Constants from "expo-constants";

type Extra = {
  apiConfigPublicUrl?: string;
  apiConfigPublicKey?: string;
  apiConfigAccessKey?: string;
  userAggPort?: string;
  mallAggPort?: string;
  servFdPort?: string;
  mallCdnBaseUrl?: string;
  tokenRefreshIntervalMs?: number;
  features?: {
    commerce?: boolean;
    cart?: boolean;
    orders?: boolean;
  };
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

function readTrimmed(value: string | undefined): string {
  return (value ?? "").trim();
}

export const apiConfigPublicUrl = readTrimmed(extra.apiConfigPublicUrl);
export const apiConfigPublicKey = readTrimmed(extra.apiConfigPublicKey);
export const apiConfigAccessKey = readTrimmed(extra.apiConfigAccessKey);
export const userAggPort = readTrimmed(extra.userAggPort);
export const mallAggPort = readTrimmed(extra.mallAggPort);
export const servFdPort = readTrimmed(extra.servFdPort);
export const mallCdnBaseUrlOverride = readTrimmed(extra.mallCdnBaseUrl);

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
