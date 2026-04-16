import { assertMallSuccess, readMallEnvelope, requireMallObjectData } from "./mallEnvelope";
import { MALL_ORDERS_PATH, mallOrderPath } from "./mallPaths";
import { normalizeOrderPagination } from "./mallPagination";
import type { OrderDetail, OrderListResult, OrderStatus, OrderSummary } from "./orderTypes";
import { fetchWithHttpDebug } from "@/lib/httpDebug";
import { getServiceOrigins } from "@/lib/serviceOrigins";

async function mallBaseOrThrow(): Promise<string> {
  const { mallAggBaseUrl } = await getServiceOrigins();
  return mallAggBaseUrl.replace(/\/$/, "");
}

function authHeaders(accessToken: string): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

function isOrderSummaryRow(row: unknown): row is Record<string, unknown> {
  return !!row && typeof row === "object" && !Array.isArray(row);
}

/** Mall JSON often sends ints as numbers; DB/JSON casts may use numeric strings. */
function mallFiniteInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string") {
    const t = value.trim();
    if (t === "") {
      return null;
    }
    const n = Number.parseInt(t, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function mallFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const t = value.trim();
    if (t === "") {
      return null;
    }
    const n = Number.parseFloat(t);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Unix seconds (int) or ISO-8601 string for the same field (`ct` / `ut`). */
function mallUnixSeconds(value: unknown): number | null {
  const asInt = mallFiniteInt(value);
  if (asInt !== null) {
    return asInt;
  }
  if (typeof value === "string") {
    const ms = Date.parse(value);
    if (!Number.isFinite(ms)) {
      return null;
    }
    return Math.floor(ms / 1000);
  }
  return null;
}

/**
 * Detail/show payloads sometimes nest the row under `order` while list items are flat.
 * Only unwraps when the nested object carries a numeric `id` (same contract as list rows).
 */
function mallOrderRowFromDetailData(data: Record<string, unknown>): Record<string, unknown> {
  const nested = data.order;
  if (
    nested &&
    typeof nested === "object" &&
    !Array.isArray(nested) &&
    mallFiniteInt((nested as Record<string, unknown>).id) !== null
  ) {
    return nested as Record<string, unknown>;
  }
  return data;
}

function toOrderSummary(row: Record<string, unknown>): OrderSummary {
  const id = mallFiniteInt(row.id);
  const uid = mallFiniteInt(row.uid);
  const statusRaw = row.status;
  const total = mallFiniteNumber(row.total_price);
  const ct = mallUnixSeconds(row.ct);
  const ut = mallUnixSeconds(row.ut);

  const problems: string[] = [];
  if (id === null) {
    problems.push("id");
  }
  if (uid === null) {
    problems.push("uid");
  }
  const statusInt = mallFiniteInt(statusRaw);
  if (statusInt === null || statusInt < 0 || statusInt > 2) {
    problems.push(
      `status (need int 0–2, got ${statusRaw === null || statusRaw === undefined ? String(statusRaw) : JSON.stringify(statusRaw)})`,
    );
  }
  if (total === null) {
    problems.push("total_price");
  }
  if (ct === null) {
    problems.push("ct");
  }
  if (ut === null) {
    problems.push("ut");
  }
  if (problems.length > 0) {
    throw new Error(`Malformed order row: ${problems.join(", ")}`);
  }

  const status = statusInt as OrderStatus;
  return {
    id: id as number,
    uid: uid as number,
    status,
    total_price: Math.round(total as number),
    ct: ct as number,
    ut: ut as number,
  };
}

function optionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const t = value.trim();
  return t === "" ? undefined : t;
}

function toOrderLine(row: unknown): OrderDetail["lines"][number] {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    throw new Error("Malformed order line");
  }
  const r = row as Record<string, unknown>;
  const pid = mallFiniteInt(r.pid);
  const quantity = mallFiniteInt(r.quantity);
  const unit_price = mallFiniteNumber(r.unit_price);
  if (pid === null || quantity === null || unit_price === null) {
    throw new Error("Malformed order line fields");
  }
  const title = optionalTrimmedString(
    r.title ?? r.product_title ?? r.name ?? r.product_name,
  );
  const thumbnail = optionalTrimmedString(
    r.thumbnail ?? r.thumb ?? r.image ?? r.image_url ?? r.product_thumbnail,
  );
  return {
    pid,
    quantity,
    unit_price: Math.round(unit_price),
    ...(title !== undefined ? { title } : {}),
    ...(thumbnail !== undefined ? { thumbnail } : {}),
  };
}

function toOrderDetail(data: Record<string, unknown>): OrderDetail {
  const base = toOrderSummary(data);
  const linesRaw = data.lines;
  if (!Array.isArray(linesRaw)) {
    throw new Error("Malformed order detail");
  }
  const lines = linesRaw.map(toOrderLine);
  return { ...base, lines };
}

export async function fetchMallOrdersPage(
  accessToken: string,
  params?: { page?: number; per_page?: number },
): Promise<OrderListResult> {
  const base = await mallBaseOrThrow();
  const page = params?.page ?? 1;
  const perPage = params?.per_page ?? 15;
  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  const res = await fetchWithHttpDebug(`${base}${MALL_ORDERS_PATH}?${qs.toString()}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  const env = await readMallEnvelope(res);
  if (res.status === 401) {
    throw new Error(env.message?.trim() || "Unauthorized");
  }
  if (!res.ok) {
    throw new Error(env.message?.trim() || `HTTP ${res.status}`);
  }
  assertMallSuccess(env);
  const data = requireMallObjectData(env);
  const itemsRaw = data.items;
  const pagRaw = data.pagination;
  if (!Array.isArray(itemsRaw) || !pagRaw || typeof pagRaw !== "object" || Array.isArray(pagRaw)) {
    throw new Error("Malformed order list");
  }
  const items = itemsRaw
    .filter(isOrderSummaryRow)
    .map((row) => toOrderSummary(row));
  const pagination = normalizeOrderPagination(pagRaw as Record<string, unknown>);
  return { items, pagination };
}

export type CreateMallOrderLine = {
  product_id: number;
  quantity: number;
  unit_price: number;
};

function parseCreatedOrderId(data: Record<string, unknown>): number {
  const row = mallOrderRowFromDetailData(data);
  const id = mallFiniteInt(row.id);
  if (id === null) {
    throw new Error("Create order response missing order id");
  }
  return id;
}

/** `POST /api/mall/orders` with JSON body `{ lines: [{ product_id, quantity, unit_price }] }`. */
export async function createMallOrder(
  accessToken: string,
  lines: CreateMallOrderLine[],
): Promise<number> {
  const base = await mallBaseOrThrow();
  const res = await fetchWithHttpDebug(`${base}${MALL_ORDERS_PATH}`, {
    method: "POST",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lines }),
  });
  const env = await readMallEnvelope(res);
  if (res.status === 401) {
    throw new Error(env.message?.trim() || "Unauthorized");
  }
  if (!res.ok) {
    throw new Error(env.message?.trim() || `HTTP ${res.status}`);
  }
  assertMallSuccess(env);
  const data = requireMallObjectData(env);
  return parseCreatedOrderId(data);
}

export async function fetchMallOrder(accessToken: string, orderId: string): Promise<OrderDetail | null> {
  const base = await mallBaseOrThrow();
  const numId = Number.parseInt(orderId, 10);
  if (!Number.isFinite(numId) || numId < 1) {
    return null;
  }
  const res = await fetchWithHttpDebug(`${base}${mallOrderPath(numId)}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
  const env = await readMallEnvelope(res);
  if (res.status === 404) {
    return null;
  }
  if (res.status === 401) {
    throw new Error(env.message?.trim() || "Unauthorized");
  }
  if (!res.ok) {
    throw new Error(env.message?.trim() || `HTTP ${res.status}`);
  }
  assertMallSuccess(env);
  const data = requireMallObjectData(env);
  const row = mallOrderRowFromDetailData(data);
  const linesRaw = Array.isArray(row.lines) ? row.lines : data.lines;
  if (!Array.isArray(linesRaw)) {
    throw new Error("Malformed order detail");
  }
  return toOrderDetail({ ...row, lines: linesRaw });
}
