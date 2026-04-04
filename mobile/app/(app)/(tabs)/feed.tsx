import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import { FeedRow } from "@/components/app/FeedRow";
import { useFeedQuery } from "@/features/feed/hooks";
import { features } from "@/lib/config";

export default function FeedScreen() {
  const { data, isPending, isError, refetch, isRefetching } = useFeedQuery();

  if (!features.feed) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-slate-300 text-center">Feed is off in app.json extra.features.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface px-4 pt-4">
      <Text className="text-xl font-bold text-slate-100 mb-4">Feed</Text>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#a5b4fc" />
        }
        ListEmptyComponent={
          isPending ? (
            <ActivityIndicator color="#a5b4fc" />
          ) : isError ? (
            <Text className="text-red-400">Failed to load feed.</Text>
          ) : (
            <Text className="text-slate-500">Nothing here yet.</Text>
          )
        }
        renderItem={({ item }) => <FeedRow item={item} />}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
}
