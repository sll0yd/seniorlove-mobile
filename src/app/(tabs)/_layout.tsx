import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { colors } from "@/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Tab bar icon: the navigator hands us the tint color for the active/inactive state.
const icon =
  (name: IconName) =>
  ({ color, size }: { color: unknown; size: number }) => <Ionicons name={name} color={color as string} size={size + 2} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 13, fontWeight: "600" },
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontSize: 22, fontWeight: "800", color: colors.text },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Événements", tabBarIcon: icon("calendar") }} />
      <Tabs.Screen name="members" options={{ title: "Membres", tabBarIcon: icon("people") }} />
      <Tabs.Screen name="messages" options={{ title: "Messages", tabBarIcon: icon("chatbubbles") }} />
      <Tabs.Screen name="profile" options={{ title: "Mon profil", tabBarIcon: icon("person-circle") }} />
    </Tabs>
  );
}
