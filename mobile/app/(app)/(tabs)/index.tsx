import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import { BannerCarousel } from "@/components/app/BannerCarousel";
import { CartBar } from "@/components/app/CartBar";
import { ProductCard } from "@/components/app/ProductCard";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { useProductsInfiniteQuery } from "@/features/catalog/hooks";
import { features } from "@/lib/config";
import { useToast } from "@/lib/notifications/toast";

export default function ShopHomeScreen() {
  const router = useRouter();
  const toast = useToast();
  const {
    data,
    isPending,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProductsInfiniteQuery();
  const rows = data?.pages.flatMap((p) => p.items) ?? [];
  const [promoOpen, setPromoOpen] = useState(false);

  if (!features.commerce) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-slate-300 text-center">Commerce is off in app.json extra.features.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface pt-2">
      <View className="px-4 flex-row justify-between items-center mb-2">
        <Text className="text-xl font-bold text-slate-100">Discover</Text>
        <Button title="Promo" variant="ghost" className="py-2 px-3" onPress={() => setPromoOpen(true)} />
      </View>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4 items-center">
              <ActivityIndicator color="#a5b4fc" />
            </View>
          ) : null
        }
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 16 }}
        ListHeaderComponent={
          <>
            <BannerCarousel />
            {isError ? (
              <Text className="text-red-400 px-4 mb-2">Could not load products.</Text>
            ) : null}
          </>
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#a5b4fc" />
        }
        ListEmptyComponent={
          isPending ? (
            <View className="py-8 items-center">
              <ActivityIndicator color="#a5b4fc" />
            </View>
          ) : (
            <Text className="text-slate-500 px-4">No products.</Text>
          )
        }
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => router.push(`/(app)/product/${item.id}`)} />
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
      <CartBar onCheckout={() => router.push("/(app)/checkout")} />
      <AppModal visible={promoOpen} title="Promotion" onClose={() => setPromoOpen(false)}>
        <Text className="text-slate-300 text-sm leading-6">
          Generic modal shell — campaigns, terms, or forced updates.
        </Text>
        <Button title="Claim mock offer" className="mt-4" onPress={() => toast.show("Offer claimed")} />
      </AppModal>
    </View>
  );
}
