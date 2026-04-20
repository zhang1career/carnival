import { jsonBearerHeaders } from "./bearerRequestHeaders";
import { useAuthStore } from "@/stores/authStore";

/**
 * Headers for `/api/mall-agg/*` requests: `Authorization: Bearer <access_token>`
 * (same session field as POST/PUT login — `LoginSession.accessToken`).
 */
export function mallAggBearerHeaders(overrides?: Record<string, string>): HeadersInit {
  const token = useAuthStore.getState().accessToken?.trim();
  if (!token) {
    throw new Error("Missing access token; sign in required for mall-agg requests");
  }
  return jsonBearerHeaders(token, overrides);
}
