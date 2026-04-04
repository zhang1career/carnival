import { apiBaseUrl } from "@/lib/config";
import { USER_REGISTER_PATH } from "@/lib/api/userApiPaths";
import type { LoginSession } from "@/lib/api/authTypes";
import {
  assertUserApiSuccess,
  parseUserApiJson,
  sessionFromEnvelope,
} from "@/lib/api/userApiEnvelope";

export type RegisterParams = {
  username: string;
  password: string;
  email: string;
  phone: string;
  noticeChannel: string;
  noticeTarget: string;
};

/** `multipart/form-data` to `POST .../api/user/register`. Returns a session if the API includes tokens in `data`. */
export async function registerAccount(params: RegisterParams): Promise<LoginSession | null> {
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
  assertUserApiSuccess(env);
  return sessionFromEnvelope(env);
}
