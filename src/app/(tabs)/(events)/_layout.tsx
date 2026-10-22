import { Stack } from "expo-router";
import { largeTitleOptions } from "@/navigation";

export default function Layout() {
  return (
    <Stack screenOptions={largeTitleOptions}>
      <Stack.Screen name="index" options={{ title: "Événements" }} />
    </Stack>
  );
}
