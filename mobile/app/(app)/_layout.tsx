import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

export default function AppGroupLayout() {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Redirect href="/(auth)/login" />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0f172a" } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="product/[id]"
        options={{ headerShown: true, title: "Product", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="checkout"
        options={{ headerShown: true, title: "Checkout", headerBackTitle: "Back" }}
      />
    </Stack>
  );
}
