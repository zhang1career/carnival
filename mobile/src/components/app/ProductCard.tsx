import { Image, Pressable, Text, View } from "react-native";
import type { Product } from "@/lib/api/types";

type Props = {
  product: Product;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: Props) {
  const price = (product.priceCents / 100).toFixed(2);
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 min-w-[46%] max-w-[50%] bg-surface-card rounded-xl border border-surface-border overflow-hidden mb-3 active:opacity-90"
    >
      <Image
        source={{ uri: product.imageUrl }}
        style={{ width: "100%", height: 144 }}
        resizeMode="cover"
      />
      <View className="p-2">
        <Text className="text-slate-100 text-sm font-medium" numberOfLines={2}>
          {product.title}
        </Text>
        <Text className="text-brand-muted text-xs mt-1">${price}</Text>
      </View>
    </Pressable>
  );
}
