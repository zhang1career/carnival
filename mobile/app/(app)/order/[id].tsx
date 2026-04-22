import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProductQuery } from "@/features/catalog/hooks";
import { useOrderQuery } from "@/features/orders/hooks";
import type { PrepayStub } from "@/lib/api/checkoutTypes";
import { mallProductImageUri } from "@/lib/mallCdn";
import { orderStatusLabel, type OrderLine } from "@/lib/api/orderTypes";

/** Bottom inset only (no tab bar on this screen). */
const SCROLL_BOTTOM_EXTRA = 24;

function formatMinor(n: number): string {
  return `$${(n / 100).toFixed(2)}`;
}

function formatTime(sec: number): string {
  try {
    return new Date(sec * 1000).toLocaleString();
  } catch {
    return String(sec);
  }
}

function parsePrepayStubParam(raw: string | undefined): PrepayStub | null {
  if (raw == null || raw === "") {
    return null;
  }
  try {
    const decoded = decodeURIComponent(raw);
    const o = JSON.parse(decoded) as unknown;
    if (!o || typeof o !== "object" || Array.isArray(o)) {
      return null;
    }
    const r = o as Record<string, unknown>;
    const order_id =
      typeof r.order_id === "number" && Number.isFinite(r.order_id)
        ? Math.trunc(r.order_id)
        : Number.parseInt(String(r.order_id ?? ""), 10) || 0;
    const amount_minor =
      typeof r.amount_minor === "number" && Number.isFinite(r.amount_minor)
        ? Math.trunc(r.amount_minor)
        : Number.parseInt(String(r.amount_minor ?? ""), 10) || 0;
    const uid =
      typeof r.uid === "number" && Number.isFinite(r.uid)
        ? Math.trunc(r.uid)
        : Number.parseInt(String(r.uid ?? ""), 10) || 0;
    const statusRaw = r.status;
    const status =
      typeof statusRaw === "string" ? statusRaw : statusRaw == null ? "" : String(statusRaw);
    return { order_id, amount_minor, uid, status };
  } catch {
    return null;
  }
}

function OrderLineRow({ line }: { line: OrderLine }) {
  const needProduct = !line.title?.trim() || !line.thumbnail?.trim();
  const { data: product, isPending } = useProductQuery(String(line.pid), {
    enabled: needProduct,
  });
  const title =
    (line.title && line.title.trim()) ||
    product?.title ||
    (isPending && needProduct ? "" : "—");
  const imageUri =
    line.thumbnail && line.thumbnail.trim()
      ? mallProductImageUri(line.thumbnail, product?.imageUrl ?? "")
      : product
        ? mallProductImageUri(product.thumbnail, product.imageUrl)
        : undefined;
  const lineTotal = line.quantity * line.unit_price;

  return (
    <View className="flex-row items-center gap-3 bg-surface-card border border-surface-border rounded-lg p-3 mb-2">
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          className="w-14 h-14 rounded-lg bg-slate-800"
          resizeMode="cover"
        />
      ) : (
        <View className="w-14 h-14 rounded-lg bg-slate-800 items-center justify-center overflow-hidden">
          {isPending && needProduct ? (
            <ActivityIndicator color="#a5b4fc" size="small" />
          ) : null}
        </View>
      )}
      <View className="flex-1 min-w-0 justify-center">
        {isPending && needProduct && !line.title?.trim() ? (
          <ActivityIndicator color="#64748b" size="small" style={{ alignSelf: "flex-start" }} />
        ) : (
          <Text className="text-slate-200 text-sm" numberOfLines={3}>
            {title}
          </Text>
        )}
      </View>
      <View className="items-end shrink-0">
        <Text className="text-slate-300 text-sm">×{line.quantity}</Text>
        <Text className="text-brand-muted text-sm mt-0.5">{formatMinor(lineTotal)}</Text>
      </View>
    </View>
  );
}

export default function OrderDetailScreen() {
  const params = useLocalSearchParams<{ id: string; prepayJson?: string }>();
  const { id } = params;
  const prepayJsonRaw = params.prepayJson;
  const prepayJson = Array.isArray(prepayJsonRaw) ? prepayJsonRaw[0] : prepayJsonRaw;
  const prepayStub = parsePrepayStubParam(prepayJson);

  const insets = useSafeAreaInsets();
  const { data: order, isPending, isError, error, isSuccess } = useOrderQuery(id ?? "");
  const bottomPad = insets.bottom + SCROLL_BOTTOM_EXTRA;

  const showCoordinatorMeta =
    order &&
    (order.ext_inventory !== undefined ||
      order.checkout_phase !== undefined ||
      (order.tid !== undefined && order.tid !== ""));

  if (isPending) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator color="#a5b4fc" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-6">
        <Text className="text-red-400 text-center">
          {error instanceof Error ? error.message : "Could not load order."}
        </Text>
      </View>
    );
  }

  if (isSuccess && order === null) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-6">
        <Text className="text-slate-400 text-center">Order not found.</Text>
      </View>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: bottomPad,
      }}
    >
      {order.lines.map((line, idx) => (
        <OrderLineRow key={`${line.pid}-${idx}`} line={line} />
      ))}

      <Text className="text-slate-400 mt-6 capitalize">
        Status: {orderStatusLabel(order.status)}
      </Text>
      <Text className="text-brand-muted text-lg mt-2">{formatMinor(order.total_price)}</Text>
      <Text className="text-slate-500 text-sm mt-4">Created: {formatTime(order.ct)}</Text>
      <Text className="text-slate-500 text-sm">Updated: {formatTime(order.ut)}</Text>

      {showCoordinatorMeta ? (
        <View className="mt-6 pt-4 border-t border-surface-border gap-1">
          <Text className="text-slate-400 text-sm font-semibold">Checkout (coordinator)</Text>
          {order.ext_inventory !== undefined ? (
            <Text className="text-slate-500 text-xs">ext_inventory: {String(order.ext_inventory)}</Text>
          ) : null}
          {order.checkout_phase !== undefined ? (
            <Text className="text-slate-500 text-xs">checkout_phase: {order.checkout_phase}</Text>
          ) : null}
          {order.tid !== undefined && order.tid !== "" ? (
            <Text className="text-slate-500 text-xs" selectable>
              tid: {order.tid}
            </Text>
          ) : null}
        </View>
      ) : null}

      {prepayStub ? (
        <View className="mt-6 pt-4 border-t border-surface-border gap-1">
          <Text className="text-slate-400 text-sm font-semibold">预支付（占位）</Text>
          <Text className="text-slate-500 text-xs">status: {prepayStub.status || "—"}</Text>
          <Text className="text-slate-500 text-xs">amount: {formatMinor(prepayStub.amount_minor)}</Text>
          <Text className="text-slate-500 text-xs">order_id: {prepayStub.order_id}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
