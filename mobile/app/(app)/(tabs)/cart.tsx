import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createMallOrder } from "@/lib/api/mallOrdersApi";
import { features } from "@/lib/config";
import { useToast } from "@/lib/notifications/toast";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore, type CartLine } from "@/stores/cartStore";

const THUMB_SIZE = 64;
const FLOAT_BAR_EXTRA = 56;

function checkoutLines(lines: CartLine[]) {
  return lines
    .filter((l) => l.qty > 0)
    .map((l) => {
      const pid = Number.parseInt(l.productId, 10);
      if (!Number.isFinite(pid) || pid < 1) {
        return null;
      }
      return {
        product_id: pid,
        quantity: l.qty,
        unit_price: l.priceCents,
      };
    })
    .filter(
      (x): x is { product_id: number; quantity: number; unit_price: number } => x !== null,
    );
}

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  const lines = useCartStore((s) => s.lines);
  const incrementQty = useCartStore((s) => s.incrementQty);
  const decrementQty = useCartStore((s) => s.decrementQty);
  const clear = useCartStore((s) => s.clear);

  const payload = checkoutLines(lines);
  const checkoutEnabled = payload.length > 0 && !!token;

  const settleMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error("Not signed in");
      }
      const body = checkoutLines(lines);
      if (body.length === 0) {
        throw new Error("Nothing to checkout");
      }
      return createMallOrder(token, body);
    },
    onSuccess: (orderId) => {
      clear();
      queryClient.invalidateQueries({ queryKey: ["mall-orders"] });
      toast.show("订单已创建");
      router.push(`/(app)/order/${orderId}`);
    },
    onError: (e) => {
      toast.show(e instanceof Error ? e.message : "下单失败");
    },
  });

  if (!features.cart) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ paddingTop: insets.top }}>
        <Text className="text-slate-300 text-center">购物车已在应用配置中关闭。</Text>
      </View>
    );
  }

  const bottomPad = insets.bottom + FLOAT_BAR_EXTRA;

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pb-2" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-xl font-bold text-slate-100">Cart</Text>
      </View>

      <FlatList
        data={lines}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: bottomPad,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <Text className="text-slate-500 py-8 text-center">购物车是空的</Text>
        }
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-surface-card border border-surface-border rounded-xl p-3 mb-3">
            <Pressable
              onPress={() => router.push(`/(app)/product/${item.productId}`)}
              className="flex-row items-center flex-1 min-w-0 active:opacity-90"
            >
              {item.imageUri ? (
                <Image
                  source={{ uri: item.imageUri }}
                  style={{
                    width: THUMB_SIZE,
                    height: THUMB_SIZE,
                    borderRadius: 8,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  className="bg-slate-700 rounded-lg items-center justify-center"
                  style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                >
                  <Ionicons name="image-outline" size={28} color="#64748b" />
                </View>
              )}
              <Text className="text-slate-100 flex-1 mx-3" numberOfLines={2}>
                {item.title}
              </Text>
            </Pressable>
            <View className="flex-row items-center">
              <Pressable
                accessibilityLabel="减少数量"
                hitSlop={8}
                className="w-9 h-9 rounded-lg bg-slate-700 items-center justify-center active:opacity-80"
                onPress={() => decrementQty(item.productId)}
              >
                <Text className="text-slate-100 text-lg font-semibold">−</Text>
              </Pressable>
              <Text className="text-slate-200 min-w-[28px] text-center text-base font-medium">
                {item.qty}
              </Text>
              <Pressable
                accessibilityLabel="增加数量"
                hitSlop={8}
                className="w-9 h-9 rounded-lg bg-slate-700 items-center justify-center active:opacity-80"
                onPress={() => incrementQty(item.productId)}
              >
                <Text className="text-slate-100 text-lg font-semibold">+</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      {lines.length > 0 ? (
        <View
          className="absolute left-0 right-0 border-t border-surface-border bg-surface"
          style={{ bottom: 0, paddingBottom: insets.bottom }}
        >
          <Pressable
            disabled={!checkoutEnabled || settleMutation.isPending}
            onPress={() => settleMutation.mutate()}
            className={`mx-4 my-3 py-3.5 rounded-xl items-center justify-center active:opacity-90 ${
              checkoutEnabled && !settleMutation.isPending ? "bg-brand" : "bg-slate-600 opacity-60"
            }`}
          >
            {settleMutation.isPending ? (
              <ActivityIndicator color="#f8fafc" />
            ) : (
              <Text className="text-white font-semibold text-base">结算</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
