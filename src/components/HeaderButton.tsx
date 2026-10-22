import { Pressable, View } from "react-native";
import { colors, space, touch } from "@/theme";
import { Icon, type IconName } from "./Icon";
import { T } from "./ui";

// Text (+ optional icon) button for the navigation bar. Labelled, not icon-only,
// so its purpose is obvious; and at least 44pt tall.
export function HeaderButton({ title, icon, onPress, bold }: { title: string; icon?: IconName; onPress: () => void; bold?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, minHeight: touch.min, justifyContent: "center", paddingHorizontal: space.xs })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.xs }}>
        {icon && <Icon name={icon} size={22} color={colors.primaryText} />}
        <T variant="callout" color={colors.primaryText} style={{ fontWeight: bold ? "600" : "400" }}>
          {title}
        </T>
      </View>
    </Pressable>
  );
}
