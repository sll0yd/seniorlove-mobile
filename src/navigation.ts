import { colors, type } from "@/theme";

// Header for every pushed screen: the back button shows where it goes ("‹ Événements").
export const stackScreenOptions = {
  headerTintColor: colors.primaryText,
  headerBackButtonDisplayMode: "default" as const,
  headerStyle: { backgroundColor: colors.background },
  headerTitleStyle: { fontSize: type.headline.fontSize, fontWeight: "600" as const, color: colors.text },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

// Top screen of each tab: iOS large title that shrinks into the bar as you scroll.
// The bar is opaque (matching the page) so it reads the same on every iOS version;
// newer iOS versions add their own scroll-edge effect on top.
export const largeTitleOptions = {
  ...stackScreenOptions,
  headerLargeTitleEnabled: true,
  headerLargeTitleShadowVisible: false,
  headerLargeTitleStyle: { color: colors.text, fontWeight: "700" as const },
  headerLargeStyle: { backgroundColor: colors.background },
};

export const TAB_TITLES: Record<string, string> = {
  "(events)": "Événements",
  "(members)": "Membres",
  "(messages)": "Messages",
  "(profile)": "Mon profil",
};
