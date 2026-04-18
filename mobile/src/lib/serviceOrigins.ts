import {
  apiConfigAccessKey,
  apiConfigPublicKey,
  apiConfigPublicUrl,
  mallCdnBaseUrlOverride,
  servFdPort,
  apiGatewayPort,
} from "@/lib/config";
import { fetchWithHttpDebug } from "@/lib/httpDebug";

type ConfigHostEnvelope = {
  errorCode?: number;
  message?: string;
  data?: {
    value?: {
      host?: unknown;
    };
  };
};

export type ServiceOrigins = {
  host: string;
  userAggBaseUrl: string;
  mallAggBaseUrl: string;
  servFdBaseUrl: string;
  mallCdnBaseUrl: string;
};

let cachedOrigins: ServiceOrigins | null = null;
let initPromise: Promise<ServiceOrigins> | null = null;
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const HOST_REFRESH_INTERVAL_MS = 30 * 60 * 1000;

function requiredEnv(name: string, value: string): string {
  if (!value) {
    throw new Error(`Missing ${name} in env`);
  }
  return value;
}

function toHttpOrigin(host: string, port: string): string {
  return `http://${host}:${port}`;
}

async function fetchConfigHost(): Promise<string> {
  const baseUrl = requiredEnv("API_CONFIG_PUBLIC_URL", apiConfigPublicUrl);
  const accessKey = requiredEnv("API_CONFIG_ACCESS_KEY", apiConfigAccessKey);
  const key = requiredEnv("API_CONFIG_PUBLIC_KEY", apiConfigPublicKey);
  const requestUrl = new URL(baseUrl);
  requestUrl.searchParams.set("access_key", accessKey);
  requestUrl.searchParams.set("key", key);
  console.log("[serviceOrigins] request config host", { url: baseUrl });
  const res = await fetchWithHttpDebug(requestUrl.toString(), { method: "GET" });
  if (!res.ok) {
    throw new Error(`Config API failed: HTTP ${res.status}`);
  }
  const payload = (await res.json()) as ConfigHostEnvelope;
  if (payload.errorCode !== 0) {
    throw new Error(payload.message?.trim() || `Config API failed: errorCode ${String(payload.errorCode)}`);
  }
  const hostRaw = payload.data?.value?.host;
  if (typeof hostRaw !== "string" || hostRaw.trim() === "") {
    throw new Error("Config API response missing data.value.host");
  }
  const host = hostRaw.trim();
  console.log("[serviceOrigins] config host resolved", { host });
  return host;
}

async function createOrigins(): Promise<ServiceOrigins> {
  const host = await fetchConfigHost();
  const gatewayBase = toHttpOrigin(host, requiredEnv("API_GATEWAY_PORT", apiGatewayPort));
  const servFdBase = toHttpOrigin(host, requiredEnv("SERV_FD_PORT", servFdPort));
  return {
    host,
    userAggBaseUrl: gatewayBase,
    mallAggBaseUrl: gatewayBase,
    servFdBaseUrl: servFdBase,
    mallCdnBaseUrl: mallCdnBaseUrlOverride || `${servFdBase}/api/cdn/2020-05-31/d/1`,
  };
}

function ensureRefreshTimer() {
  if (refreshTimer) {
    return;
  }
  console.log("[serviceOrigins] start refresh timer", { intervalMs: HOST_REFRESH_INTERVAL_MS });
  refreshTimer = setInterval(() => {
    console.log("[serviceOrigins] refresh host start");
    createOrigins()
      .then((origins) => {
        cachedOrigins = origins;
        console.log("[serviceOrigins] refresh host success", { host: origins.host });
      })
      .catch((err) => {
        console.error("[serviceOrigins] refresh host failed", err);
      });
  }, HOST_REFRESH_INTERVAL_MS);
}

export function getServiceOriginsSync(): ServiceOrigins | null {
  return cachedOrigins;
}

export async function getServiceOrigins(): Promise<ServiceOrigins> {
  if (cachedOrigins) {
    console.log("[serviceOrigins] use cached origins", { host: cachedOrigins.host });
    return cachedOrigins;
  }
  console.log("[serviceOrigins] cache miss, resolve origins");
  if (!initPromise) {
    initPromise = createOrigins()
      .then((origins) => {
        cachedOrigins = origins;
        ensureRefreshTimer();
        return origins;
      })
      .finally(() => {
        initPromise = null;
      });
  }
  return initPromise;
}

export async function initServiceOrigins(): Promise<ServiceOrigins> {
  const origins = await getServiceOrigins();
  ensureRefreshTimer();
  return origins;
}
