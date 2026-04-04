import { Text, View } from "react-native";
import { VideoPlayer } from "@/features/media/VideoPlayer";
import { features } from "@/lib/config";

const SAMPLE_MP4 = "https://storage.googleapis.com/expo-example-app/Water.mp4";

export default function MediaScreen() {
  if (!features.media) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-slate-300 text-center">Media is off in app.json extra.features.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface px-4 pt-4">
      <Text className="text-xl font-bold text-slate-100 mb-2">Video</Text>
      <Text className="text-slate-400 text-sm mb-4">Sample remote asset (expo-av).</Text>
      <VideoPlayer uri={SAMPLE_MP4} />
    </View>
  );
}
