export type MallApiEnvelope = {
  data: unknown;
  errorCode: number;
  message: string;
  _req_id: string;
};

export async function readMallEnvelope(res: Response): Promise<MallApiEnvelope> {
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (!body || typeof body !== "object") {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return body as MallApiEnvelope;
}

export function assertMallSuccess(env: MallApiEnvelope): void {
  if (env.errorCode !== 0) {
    throw new Error(env.message?.trim() || `Request failed (errorCode ${env.errorCode})`);
  }
}

export function requireMallObjectData<T extends Record<string, unknown>>(env: MallApiEnvelope): T {
  const d = env.data;
  if (!d || typeof d !== "object" || Array.isArray(d)) {
    throw new Error(env.message?.trim() || "Invalid response data");
  }
  return d as T;
}
