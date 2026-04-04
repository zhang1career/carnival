import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/notifications/toast";
import { cartTotalCents, useCartStore } from "@/stores/cartStore";

export default function CheckoutScreen() {
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const toast = useToast();
  const total = (cartTotalCents(lines) / 100).toFixed(2);

  return (
    <View className="flex-1 bg-surface px-4 pt-4">
      <Text className="text-slate-400 mb-4">Placeholder checkout — connect PSP / order API here.</Text>
      {lines.map((l) => (
        <View
          key={l.productId}
          className="flex-row justify-between py-2 border-b border-surface-border"
        >
          <Text className="text-slate-200 flex-1">
            {l.title} × {l.qty}
          </Text>
          <Text className="text-slate-400">${((l.priceCents * l.qty) / 100).toFixed(2)}</Text>
        </View>
      ))}
      <Text className="text-slate-100 text-lg font-semibold mt-6">Total ${total}</Text>
      <Button
        title="Place order (mock)"
        className="mt-6"
        onPress={() => {
          clear();
          toast.show("Order placed");
        }}
      />
    </View>
  );
}
