import type { LoginSession } from "@/lib/api/authTypes";
import { apiBaseUrl } from "@/lib/config";
import { USER_LOGIN_PATH } from "@/lib/api/userApiPaths";
import {
  assertUserApiSuccess,
  parseUserApiJson,
  requireSessionFromEnvelope,
} from "@/lib/api/userApiEnvelope";

export type { AuthUser, LoginSession } from "@/lib/api/authTypes";

export async function loginWithPassword(loginKey: string, password: string): Promise<LoginSession> {
  const base = apiBaseUrl.replace(/\/$/, "");
  if (!base) {
    throw new Error("Missing user aggregate base (API_BASE_URL + USER_AGG_PORT) in .env");
  }
  const res = await fetch(`${base}${USER_LOGIN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login_key: loginKey, password }),
  });
  const text = await res.text();
  const env = parseUserApiJson(text, res);
  assertUserApiSuccess(env);
  return requireSessionFromEnvelope(env);
}

/** `PUT .../api/user/login` with `{ refresh_token }`; response shape matches password login. */
export async function refreshSessionWithRefreshToken(refreshToken: string): Promise<LoginSession> {
  const base = apiBaseUrl.replace(/\/$/, "");
  if (!base) {
    throw new Error("Missing user aggregate base (API_BASE_URL + USER_AGG_PORT) in .env");
  }
  const res = await fetch(`${base}${USER_LOGIN_PATH}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const text = await res.text();
  const env = parseUserApiJson(text, res);
  assertUserApiSuccess(env);
  return requireSessionFromEnvelope(env);
}
