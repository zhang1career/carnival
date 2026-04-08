import { assertMallSuccess, readMallEnvelope, requireMallObjectData } from "./mallEnvelope";
import { MALL_ORDERS_PATH, mallOrderPath } from "./mallPaths";
import { normalizeOrderPagination } from "./mallPagination";
import type { OrderDetail, OrderListResult, OrderSummary } from "./orderTypes";
import { mallAggBaseUrl } from "@/lib/config";

function mallBaseOrThrow(): string {
  const base = mallAggBaseUrl.replace(/\/$/, "");
  if (!base) {
    throw new Error("Missing mallAggBaseUrl (API_BASE_URL + MALL_AGG_PORT)");
  }
  return base;
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

function toOrderSummary(row: Record<string, unknown>): OrderSummary {
  const id = row.id;
  const uid = row.uid;
  const status = row.status;
  const total = row.total_price;
  const ct = row.ct;
  const ut = row.ut;
  if (
    typeof id !== "number" ||
    typeof uid !== "number" ||
    typeof status !== "string" ||
    typeof total !== "number" ||
    typeof ct !== "number" ||
    typeof ut !== "number"
  ) {
    throw new Error("Malformed order row");
  }
  if (status !== "pending" && status !== "paid" && status !== "cancelled") {
    throw new Error("Invalid order status");
  }
  return {
    id,
    uid,
    status,
    total_price: total,
    ct,
    ut,
  };
}

function toOrderLine(row: unknown): OrderDetail["lines"][number] {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    throw new Error("Malformed order line");
  }
  const r = row as Record<string, unknown>;
  const pid = r.pid;
  const quantity = r.quantity;
  const unit_price = r.unit_price;
  if (typeof pid !== "number" || typeof quantity !== "number" || typeof unit_price !== "number") {
    throw new Error("Malformed order line fields");
  }
  return { pid, quantity, unit_price };
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
  const base = mallBaseOrThrow();
  const page = params?.page ?? 1;
  const perPage = params?.per_page ?? 15;
  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  const res = await fetch(`${base}${MALL_ORDERS_PATH}?${qs.toString()}`, {
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

export async function fetchMallOrder(accessToken: string, orderId: string): Promise<OrderDetail | null> {
  const base = mallBaseOrThrow();
  const numId = Number.parseInt(orderId, 10);
  if (!Number.isFinite(numId) || numId < 1) {
    return null;
  }
  const res = await fetch(`${base}${mallOrderPath(numId)}`, {
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
  return toOrderDetail(data);
}
