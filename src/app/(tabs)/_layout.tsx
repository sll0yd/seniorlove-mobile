import { Tabs } from "expo-router";
import { Icon, type IconName } from "@/components/Icon";
import { TAB_TITLES } from "@/navigation";
import { colors } from "@/theme";

// Tab bar icon in the colour the tab bar hands us (active / inactive).
const tabIcon =
  (name: IconName) =>
  ({ color }: { color: unknown }) => <Icon name={name} size={24} color={color as string} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // each tab has its own stack with a large title
        animation: "none", // tabs are peers: switching never slides
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarLabelStyle: { fontSize: 13, fontWeight: "600" },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.separator },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="(events)" options={{ title: TAB_TITLES["(events)"], tabBarIcon: tabIcon("calendar") }} />
      <Tabs.Screen name="(members)" options={{ title: TAB_TITLES["(members)"], tabBarIcon: tabIcon("people") }} />
      <Tabs.Screen name="(messages)" options={{ title: TAB_TITLES["(messages)"], tabBarIcon: tabIcon("chat") }} />
      <Tabs.Screen name="(profile)" options={{ title: TAB_TITLES["(profile)"], tabBarIcon: tabIcon("person") }} />
    </Tabs>
  );
}
