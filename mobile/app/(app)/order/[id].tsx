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
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: order, isPending, isError, error, isSuccess } = useOrderQuery(id ?? "");
  const bottomPad = insets.bottom + SCROLL_BOTTOM_EXTRA;

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
    </ScrollView>
  );
}
