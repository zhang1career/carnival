const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

/** `API_BASE_URL` (no port) + port env → origin string. @returns {string | undefined} */
function originWithPort(apiBase, portRaw) {
  if (apiBase == null || String(apiBase).trim() === "") return undefined;
  if (portRaw == null || String(portRaw).trim() === "") return undefined;
  try {
    const u = new URL(String(apiBase).trim());
    u.port = String(portRaw).trim();
    return u.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

/** User aggregate API: `API_BASE_URL` + `USER_AGG_PORT`. */
function userAggBaseUrlFromEnv() {
  return originWithPort(process.env.API_BASE_URL, process.env.USER_AGG_PORT);
}

/** Mall aggregate API: `API_BASE_URL` + `MALL_AGG_PORT`. */
function mallAggBaseUrlFromEnv() {
  return originWithPort(process.env.API_BASE_URL, process.env.MALL_AGG_PORT);
}

/** Static / CDN origin for thumbnails: `API_BASE_URL` + `SERV_FD_PORT` + `/api/cdn/2020-05-31/d/1`. */
function mallCdnBaseUrlFromEnv() {
  const origin = originWithPort(process.env.API_BASE_URL, process.env.SERV_FD_PORT);
  if (!origin) return undefined;
  return `${origin}/api/cdn/2020-05-31/d/1`;
}

/** @type {import('@expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: "Platform Scaffold",
    slug: "platform-scaffold",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "platformscaffold",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0f172a",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.example.platformscaffold",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundColor: "#0f172a",
      },
      package: "com.example.platformscaffold",
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png",
    },
    plugins: ["expo-router"],
    extra: {
      router: { origin: false },
      apiBaseUrl: userAggBaseUrlFromEnv(),
      mallAggBaseUrl: mallAggBaseUrlFromEnv(),
      mallCdnBaseUrl:
        (process.env.MALL_CDN_BASE_URL && String(process.env.MALL_CDN_BASE_URL).trim()) ||
        mallCdnBaseUrlFromEnv(),
      tokenRefreshIntervalMs: (() => {
        const raw = process.env.TOKEN_REFRESH_INTERVAL_MS;
        if (raw == null || String(raw).trim() === "") return undefined;
        const n = Number.parseInt(String(raw), 10);
        return Number.isFinite(n) && n > 0 ? n : undefined;
      })(),
      features: {
        commerce: true,
        feed: true,
        orders: true,
      },
    },
  },
};
