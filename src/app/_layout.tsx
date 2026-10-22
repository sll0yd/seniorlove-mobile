import { Stack } from "expo-router";
import { getFocusedRouteNameFromRoute } from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";
import { useReducedMotion } from "react-native-reanimated";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { Loading } from "@/components/ui";
import { stackScreenOptions, TAB_TITLES } from "@/navigation";

function RootNavigator() {
  const { isLoading, user } = useAuth();
  const reduced = useReducedMotion();
  if (isLoading) return <Loading />;

  return (
    <Stack screenOptions={{ ...stackScreenOptions, animation: reduced ? "fade" : "default" }}>
      {/* Only reachable when logged in, like ProtectedRoute in the web app */}
      <Stack.Protected guard={!!user}>
        <Stack.Screen
          name="(tabs)"
          // The tab's name becomes the back-button label of the next screen ("‹ Membres").
          options={({ route }) => ({ headerShown: false, title: TAB_TITLES[getFocusedRouteNameFromRoute(route) ?? "(events)"] })}
        />
        <Stack.Screen name="events/[id]" options={{ title: "Événement" }} />
        <Stack.Screen name="members/[id]" options={{ title: "Profil" }} />
        <Stack.Screen name="chat/[id]" options={{ title: "Conversation" }} />
        <Stack.Screen name="events/new" options={{ title: "Nouvel événement", presentation: "modal" }} />
        <Stack.Screen name="edit-profile" options={{ title: "Modifier mon profil", presentation: "modal" }} />
      </Stack.Protected>

      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)/login" options={{ headerShown: false, title: "Connexion" }} />
        <Stack.Screen name="(auth)/register" options={{ title: "Créer un compte" }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}
