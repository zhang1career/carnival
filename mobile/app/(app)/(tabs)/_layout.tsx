import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { features } from "@/lib/config";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0f172a" },
        headerTintColor: "#f1f5f9",
        tabBarStyle: { backgroundColor: "#1e293b", borderTopColor: "#334155" },
        tabBarActiveTintColor: "#a5b4fc",
        tabBarInactiveTintColor: "#64748b",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Shop",
          href: features.commerce ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag-handle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "购物车",
          href: features.cart ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          href: features.orders ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
