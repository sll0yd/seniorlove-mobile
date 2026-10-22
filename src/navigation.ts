import { Platform } from "react-native";
import { colors, type } from "@/theme";

const ios = Platform.OS === "ios";

// Header for every pushed screen: the back button shows where it goes ("‹ Événements").
export const stackScreenOptions = {
  headerTintColor: colors.primaryText,
  headerBackButtonDisplayMode: "default" as const,
  headerStyle: { backgroundColor: colors.background },
  headerTitleStyle: { fontSize: type.headline.fontSize, fontWeight: "600" as const, color: colors.text },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

// Top screen of each tab: iOS large title that shrinks into a translucent bar as you scroll.
// Screens using this must set contentInsetAdjustmentBehavior="automatic" on their scroll view.
export const largeTitleOptions = {
  ...stackScreenOptions,
  headerLargeTitleEnabled: true,
  headerLargeTitleShadowVisible: false,
  headerLargeTitleStyle: { color: colors.text, fontWeight: "700" as const },
  headerLargeStyle: { backgroundColor: colors.background },
  headerTransparent: ios,
  headerBlurEffect: ios ? ("systemChromeMaterialLight" as const) : undefined,
  headerStyle: ios ? undefined : { backgroundColor: colors.background },
};

export const TAB_TITLES: Record<string, string> = {
  "(events)": "Événements",
  "(members)": "Membres",
  "(messages)": "Messages",
  "(profile)": "Mon profil",
};
