import { useRouter } from "expo-router";
import { memo, useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BannerCarousel } from "@/components/app/BannerCarousel";
import { CartBar } from "@/components/app/CartBar";
import { ProductCard } from "@/components/app/ProductCard";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { useProductsInfiniteQuery } from "@/features/catalog/hooks";
import { getCommerceRepo } from "@/lib/api";
import { features } from "@/lib/config";
import { useToast } from "@/lib/notifications/toast";
import { useProductListStore } from "@/stores/productListStore";

/**
 * Search text lives here so parent re-renders (FlatList / React Query) do not reset
 * the IME composition state while typing CJK.
 */
const ShopSearchBar = memo(function ShopSearchBar({
  busy,
  onSearch,
}: {
  busy: boolean;
  onSearch: (query: string) => void | Promise<void>;
}) {
  const [text, setText] = useState("");

  const submit = () => {
    void onSearch(text);
  };

  return (
    <View className="px-4 mb-3 gap-2">
      <View className="flex-row items-stretch gap-2">
        <TextInput
          className="flex-1 rounded-xl border border-surface-border bg-surface-card px-3 py-2.5 text-slate-100 text-base"
          placeholder="搜索商品"
          placeholderTextColor="#64748b"
          value={text}
          onChangeText={setText}
          keyboardType="default"
          autoCapitalize="none"
          /** Search + CJK: spell-check and autocorrect fight iOS marked-text composition. */
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="search"
          editable={!busy}
          blurOnSubmit={Platform.OS === "android" ? false : undefined}
          onSubmitEditing={submit}
          {...(Platform.OS === "android"
            ? {
                autoComplete: "off" as const,
                importantForAutofill: "no" as const,
              }
            : {})}
        />
        <Button
          title={busy ? "…" : "搜索"}
          className="px-4 py-2.5 justify-center"
          disabled={busy}
          onPress={submit}
        />
      </View>
    </View>
  );
});

export default function ShopHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const [searchBusy, setSearchBusy] = useState(false);
  const setProductListFromSearch = useProductListStore((s) => s.setFromSearch);

  if (!features.commerce) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ paddingTop: insets.top }}>
        <Text className="text-slate-300 text-center">Commerce is off in app.json extra.features.</Text>
      </View>
    );
  }

  const runSearch = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      if (!q) {
        toast.show("请输入搜索关键词");
        return;
      }
      setSearchBusy(true);
      try {
        const ids = await getCommerceRepo().searchProductIds(q);
        setProductListFromSearch(ids, q);
        router.push("/(app)/product-list");
      } catch (e) {
        toast.show(e instanceof Error ? e.message : "搜索失败");
      } finally {
        setSearchBusy(false);
      }
    },
    [router, setProductListFromSearch, toast],
  );

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top + 8 }}>
      <ShopSearchBar busy={searchBusy} onSearch={runSearch} />
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
      <CartBar onCheckout={() => router.push("/(app)/(tabs)/cart")} />
      <AppModal visible={promoOpen} title="Promotion" onClose={() => setPromoOpen(false)}>
        <Text className="text-slate-300 text-sm leading-6">
          Generic modal shell — campaigns, terms, or forced updates.
        </Text>
        <Button title="Claim mock offer" className="mt-4" onPress={() => toast.show("Offer claimed")} />
      </AppModal>
    </View>
  );
}
