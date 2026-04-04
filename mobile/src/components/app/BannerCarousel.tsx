import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const BANNER_H = 160;
const PAGE = Math.min(width - 32, 400);

export type BannerSlide = { id: string; title: string; imageUrl: string };

const defaultSlides: BannerSlide[] = [
  { id: "b1", title: "Spring drop", imageUrl: "https://picsum.photos/seed/b1/800/400" },
  { id: "b2", title: "Audio week", imageUrl: "https://picsum.photos/seed/b2/800/400" },
  { id: "b3", title: "Desk setup", imageUrl: "https://picsum.photos/seed/b3/800/400" },
];

export function BannerCarousel({ slides = defaultSlides }: { slides?: BannerSlide[] }) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / (PAGE + 12));
    if (i !== index && i >= 0 && i < slides.length) setIndex(i);
  };

  return (
    <View className="mb-4">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={PAGE + 12}
        contentContainerStyle={{ paddingHorizontal: 4, gap: 12 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {slides.map((s) => (
          <View key={s.id} style={{ width: PAGE }}>
            <View className="rounded-2xl overflow-hidden border border-surface-border bg-surface-card">
              <Image
                source={{ uri: s.imageUrl }}
                style={{ width: "100%", height: BANNER_H }}
                resizeMode="cover"
              />
              <Text className="text-slate-200 px-3 py-2 text-sm font-medium">{s.title}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View className="flex-row justify-center gap-1.5 mt-2">
        {slides.map((s, i) => (
          <View
            key={s.id}
            className={`h-1.5 rounded-full ${i === index ? "w-4 bg-brand" : "w-1.5 bg-slate-600"}`}
          />
        ))}
      </View>
    </View>
  );
}
