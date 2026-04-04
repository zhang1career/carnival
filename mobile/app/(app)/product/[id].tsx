import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { useProductQuery } from "@/features/catalog/hooks";
import { useToast } from "@/lib/notifications/toast";
import { useCartStore } from "@/stores/cartStore";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const add = useCartStore((s) => s.add);
  const { data: product, isPending } = useProductQuery(id ?? "");

  if (isPending || !product) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator color="#a5b4fc" />
      </View>
    );
  }

  const price = (product.priceCents / 100).toFixed(2);

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ paddingBottom: 32 }}>
      <Image source={{ uri: product.imageUrl }} style={{ width: "100%", height: 280 }} resizeMode="cover" />
      <View className="p-4">
        <Text className="text-2xl font-bold text-slate-100">{product.title}</Text>
        <Text className="text-brand-muted text-lg mt-2">${price}</Text>
        <Text className="text-slate-400 mt-4 leading-6">{product.description}</Text>
        <Button
          title="Add to cart"
          className="mt-8"
          onPress={() => {
            add(product);
            toast.show("Added to cart");
          }}
        />
        <Button title="Back to shop" variant="ghost" className="mt-3" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}
