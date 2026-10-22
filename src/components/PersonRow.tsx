import { View } from "react-native";
import { colors, space } from "@/theme";
import { Icon } from "./Icon";
import { Avatar, Card, PressableScale, styles, T } from "./ui";

// The one row used for people everywhere: members list and conversations.
export function PersonRow({
  name,
  picture,
  title,
  subtitle,
  detail,
  onPress,
  accessibilityLabel,
}: {
  name: string;
  picture?: string | null;
  title: string;
  subtitle?: string | null;
  detail?: string | null;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? title}>
      <Card style={styles.row}>
        <Avatar uri={picture} name={name} size={60} />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <T variant="headline" numberOfLines={2}>
            {title}
          </T>
          {!!subtitle && (
            <T variant="subhead" color={colors.secondaryText} numberOfLines={1}>
              {subtitle}
            </T>
          )}
          {!!detail && (
            <T variant="footnote" color={colors.primaryText} numberOfLines={2} style={{ fontWeight: "600", marginTop: space.xs / 2 }}>
              {detail}
            </T>
          )}
        </View>
        <Icon name="chevron" size={16} color={colors.secondaryText} />
      </Card>
    </PressableScale>
  );
}
