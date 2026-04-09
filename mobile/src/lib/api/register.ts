import { apiBaseUrl } from "@/lib/config";
import {
  optionalEventIdFromData,
  parseUserApiJson,
  requireEventIdFromData,
  sessionFromEnvelope,
} from "@/lib/api/userApiEnvelope";
import type { LoginSession } from "@/lib/api/authTypes";
import {
  PENDING_VERIFICATION_ERROR_CODE,
  PendingVerificationError,
} from "@/lib/api/pendingVerificationError";
import { USER_REGISTER_PATH, USER_REGISTER_VERIFY_PATH } from "@/lib/api/userApiPaths";

export { PENDING_VERIFICATION_ERROR_CODE, PendingVerificationError } from "@/lib/api/pendingVerificationError";

export type RegisterParams = {
  username: string;
  password: string;
  email: string;
  phone: string;
  noticeChannel: string;
  noticeTarget: string;
};

export type RegisterResult = {
  eventId: number;
  session: LoginSession | null;
};

/** `multipart/form-data` to `POST .../api/user/register`. */
export async function registerAccount(params: RegisterParams): Promise<RegisterResult> {
  const base = apiBaseUrl.replace(/\/$/, "");
  if (!base) {
    throw new Error("Missing user aggregate base (API_BASE_URL + USER_AGG_PORT) in .env");
  }
  const form = new FormData();
  form.append("username", params.username);
  form.append("password", params.password);
  form.append("email", params.email);
  form.append("phone", params.phone);
  form.append("notice_channel", params.noticeChannel);
  form.append("notice_target", params.noticeTarget);
  const res = await fetch(`${base}${USER_REGISTER_PATH}`, {
    method: "POST",
    body: form,
  });
  const text = await res.text();
  const env = parseUserApiJson(text, res);
  if (env.errorCode !== 0) {
    const msg = env.message?.trim() || `Request failed (errorCode ${env.errorCode})`;
    const eventIdOpt = optionalEventIdFromData(env.data);
    const detail = typeof env.detail === "string" ? env.detail : undefined;
    if (env.errorCode === PENDING_VERIFICATION_ERROR_CODE) {
      throw new PendingVerificationError(msg, env.errorCode, { eventId: eventIdOpt, detail });
    }
    throw new Error(msg);
  }
  return {
    eventId: requireEventIdFromData(env.data, "Register response missing event_id"),
    session: sessionFromEnvelope(env),
  };
}

/** `POST .../api/user/register/verify` with JSON body `{ event_id, code }`. */
export async function verifyRegisterCode(eventId: number, code: string): Promise<LoginSession | null> {
  const base = apiBaseUrl.replace(/\/$/, "");
  if (!base) {
    throw new Error("Missing user aggregate base (API_BASE_URL + USER_AGG_PORT) in .env");
  }
  const res = await fetch(`${base}${USER_REGISTER_VERIFY_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_id: eventId, code }),
  });
  const text = await res.text();
  const env = parseUserApiJson(text, res);
  if (env.errorCode !== 0) {
    throw new Error(env.message?.trim() || `Request failed (errorCode ${env.errorCode})`);
  }
  return sessionFromEnvelope(env);
}
