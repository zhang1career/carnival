import { apiBaseUrl } from "@/lib/config";
import {
  parseUserApiJson,
  sessionFromEnvelope,
  type UserApiEnvelope,
} from "@/lib/api/userApiEnvelope";
import type { LoginSession } from "@/lib/api/authTypes";
import { USER_REGISTER_PATH, USER_REGISTER_VERIFY_PATH } from "@/lib/api/userApiPaths";

/** Server: registration already pending (e.g. notice target in cooldown). Often paired with `data.event_id` to resume verify. */
export const REGISTER_PENDING_ERROR_CODE = 304;

export class RegisterPendingError extends Error {
  readonly errorCode: number;
  readonly eventId?: number;
  readonly detail?: string;

  constructor(
    message: string,
    errorCode: number,
    options?: { eventId?: number; detail?: string },
  ) {
    super(message);
    this.name = "RegisterPendingError";
    this.errorCode = errorCode;
    this.eventId = options?.eventId;
    this.detail = options?.detail;
  }
}

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

function optionalEventIdFromData(data: UserApiEnvelope["data"]): number | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }
  const id = (data as { event_id?: unknown }).event_id;
  return typeof id === "number" ? id : undefined;
}

function eventIdFromRegisterData(data: UserApiEnvelope["data"]): number {
  const id = optionalEventIdFromData(data);
  if (id === undefined) {
    throw new Error("Register response missing event_id");
  }
  return id;
}

/** `multipart/form-data` to `POST .../api/user/register`. */
export async function registerAccount(params: RegisterParams): Promise<RegisterResult> {
  const base = apiBaseUrl.replace(/\/$/, "");
  if (!base) {
    throw new Error("Missing API_BASE_URL in project root .env");
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
    if (env.errorCode === REGISTER_PENDING_ERROR_CODE) {
      throw new RegisterPendingError(msg, env.errorCode, { eventId: eventIdOpt, detail });
    }
    throw new Error(msg);
  }
  return {
    eventId: eventIdFromRegisterData(env.data),
    session: sessionFromEnvelope(env),
  };
}

/** `POST .../api/user/register/verify` with JSON body `{ event_id, code }`. */
export async function verifyRegisterCode(eventId: number, code: string): Promise<LoginSession | null> {
  const base = apiBaseUrl.replace(/\/$/, "");
  if (!base) {
    throw new Error("Missing API_BASE_URL in project root .env");
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
