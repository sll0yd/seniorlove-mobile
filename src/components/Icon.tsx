import Ionicons from "@expo/vector-icons/Ionicons";
import { SymbolView, type SFSymbol } from "expo-symbols";
import type { ComponentProps } from "react";
import { Platform } from "react-native";

// One icon set for the whole app: real SF Symbols on iOS, matching Ionicons elsewhere.
const ICONS = {
  calendar: ["calendar", "calendar-outline"],
  location: ["mappin.and.ellipse", "location-outline"],
  people: ["person.2.fill", "people"],
  chat: ["bubble.left.and.bubble.right.fill", "chatbubbles"],
  person: ["person.crop.circle.fill", "person-circle"],
  plus: ["plus.circle.fill", "add-circle"],
  search: ["magnifyingglass", "search"],
  eye: ["eye", "eye-outline"],
  eyeOff: ["eye.slash", "eye-off-outline"],
  send: ["arrow.up.circle.fill", "arrow-up-circle"],
  chevron: ["chevron.right", "chevron-forward"],
  check: ["checkmark", "checkmark"],
  checkCircle: ["checkmark.circle.fill", "checkmark-circle"],
  warning: ["exclamationmark.circle.fill", "alert-circle"],
  edit: ["pencil", "create-outline"],
  logout: ["rectangle.portrait.and.arrow.right", "log-out-outline"],
  host: ["star.fill", "star"],
  heart: ["heart.fill", "heart"],
  clock: ["clock", "time-outline"],
} as const satisfies Record<string, readonly [SFSymbol, ComponentProps<typeof Ionicons>["name"]]>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color: string }) {
  const [sf, ion] = ICONS[name];
  const fallback = <Ionicons name={ion} size={size} color={color} />;
  if (Platform.OS !== "ios") return fallback;
  return <SymbolView name={sf} size={size} tintColor={color} fallback={fallback} />;
}
