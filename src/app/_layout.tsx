import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { Loading } from "@/components/ui";
import { colors } from "@/theme";

function RootNavigator() {
  const { isLoading, user } = useAuth();
  if (isLoading) return <Loading />;

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primaryDark,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontSize: 20, fontWeight: "700", color: colors.text },
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Only reachable when logged in, like ProtectedRoute in the web app */}
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="events/[id]" options={{ title: "Événement" }} />
        <Stack.Screen name="events/new" options={{ title: "Nouvel événement", presentation: "modal" }} />
        <Stack.Screen name="members/[id]" options={{ title: "Profil" }} />
        <Stack.Screen name="chat/[id]" options={{ title: "Conversation" }} />
      </Stack.Protected>

      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ title: "Inscription" }} />
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
