import { Stack } from "expo-router";
import { largeTitleOptions } from "@/navigation";

export default function Layout() {
  return (
    <Stack screenOptions={largeTitleOptions}>
      <Stack.Screen name="profile" options={{ title: "Mon profil" }} />
    </Stack>
  );
}
