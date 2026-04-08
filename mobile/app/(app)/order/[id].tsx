import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { useOrderQuery } from "@/features/orders/hooks";

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

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: order, isPending, isError, error, isSuccess } = useOrderQuery(id ?? "");

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
        <Button title="Back" variant="ghost" className="mt-4" onPress={() => router.back()} />
      </View>
    );
  }

  if (isSuccess && order === null) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-6">
        <Text className="text-slate-400 text-center">Order not found.</Text>
        <Button title="Back" variant="ghost" className="mt-4" onPress={() => router.back()} />
      </View>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text className="text-2xl font-bold text-slate-100">Order #{order.id}</Text>
      <Text className="text-slate-400 mt-2 capitalize">Status: {order.status}</Text>
      <Text className="text-brand-muted text-lg mt-2">{formatMinor(order.total_price)}</Text>
      <Text className="text-slate-500 text-sm mt-4">Created: {formatTime(order.ct)}</Text>
      <Text className="text-slate-500 text-sm">Updated: {formatTime(order.ut)}</Text>

      <Text className="text-lg font-semibold text-slate-100 mt-8 mb-3">Items</Text>
      {order.lines.map((line, idx) => (
        <View
          key={`${line.pid}-${idx}`}
          className="bg-surface-card border border-surface-border rounded-lg p-3 mb-2"
        >
          <Text className="text-slate-200 text-sm">Product #{line.pid}</Text>
          <Text className="text-slate-400 text-xs mt-1">
            Qty {line.quantity} × {formatMinor(line.unit_price)}
          </Text>
        </View>
      ))}

      <Button title="Back" variant="ghost" className="mt-6" onPress={() => router.back()} />
    </ScrollView>
  );
}
