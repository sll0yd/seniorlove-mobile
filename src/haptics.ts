import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// One haptic per meaningful action, fired together with the visual change.
// Never the only feedback: the screen always changes too.
const enabled = Platform.OS === "ios" || Platform.OS === "android";
const safe = (fn: () => Promise<void>) => () => {
  if (enabled) fn().catch(() => {});
};

export const haptic = {
  /** A choice changed: tag toggled, segmented option picked. */
  selection: safe(() => Haptics.selectionAsync()),
  /** Something was committed: a message sent. */
  light: safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** An operation succeeded: joined an event, profile saved. */
  success: safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** An operation failed. */
  error: safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
