import { BlurView } from "expo-blur";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Tag } from "@/api/types";
import { imageUrl } from "@/config";
import { colors, motion, radius, space, touch, type } from "@/theme";
import { Icon, type IconName } from "./Icon";

// ─── Text ─────────────────────────────────────────────────────────────────
// Every piece of text in the app goes through <T>, so the type scale stays consistent.
export function T({
  variant = "body",
  color = colors.text,
  style,
  ...props
}: TextProps & { variant?: keyof typeof type; color?: string; style?: StyleProp<TextStyle> }) {
  return <Text {...props} style={[type[variant], { color }, style]} />;
}

// ─── Press feedback ───────────────────────────────────────────────────────
// Responds on touch-down (not on release): shrinks to 97% in 120ms.
// With "Reduce Motion" on, it dims instead of scaling.
export function PressableScale({
  children,
  style,
  containerStyle,
  disabled,
  ...props
}: Omit<PressableProps, "style" | "children"> & {
  children: ReactNode;
  /** Look of the pressable surface (scales on press). */
  style?: StyleProp<ViewStyle>;
  /** Layout of the touch area within its parent, e.g. { flex: 1 }. */
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const [pressed, setPressed] = useState(false);
  const reduced = useReducedMotion();
  return (
    <Pressable
      {...props}
      style={containerStyle}
      disabled={disabled}
      hitSlop={props.hitSlop ?? 6}
      pressRetentionOffset={16}
      onPressIn={(e) => {
        setPressed(true);
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        props.onPressOut?.(e);
      }}
    >
      <Animated.View
        style={[
          style,
          {
            transitionProperty: ["transform", "opacity"],
            transitionDuration: motion.press,
            transitionTimingFunction: motion.easeOut,
            transform: [{ scale: pressed && !reduced ? 0.97 : 1 }],
            opacity: disabled ? 0.45 : pressed && reduced ? 0.7 : 1,
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

// ─── Buttons ──────────────────────────────────────────────────────────────
// One button, four roles. Use exactly one "filled" button per screen: the main action.
type ButtonVariant = "filled" | "tinted" | "plain" | "destructive";

const BUTTON: Record<ButtonVariant, { bg: string; fg: string }> = {
  filled: { bg: colors.primary, fg: "#FFFFFF" },
  tinted: { bg: colors.primaryTint, fg: colors.primaryText },
  plain: { bg: "transparent", fg: colors.primaryText },
  destructive: { bg: "transparent", fg: colors.danger },
};

export function Button({
  title,
  onPress,
  variant = "filled",
  size = "large",
  icon,
  loading,
  disabled,
  style,
  accessibilityHint,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: "large" | "regular";
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}) {
  const v = BUTTON[variant];
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[
        styles.button,
        { backgroundColor: v.bg, minHeight: size === "large" ? touch.button : touch.min },
        size === "regular" && { paddingHorizontal: space.lg },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon && <Icon name={icon} size={20} color={v.fg} />}
          <T variant="button" color={v.fg} numberOfLines={1}>
            {title}
          </T>
        </>
      )}
    </PressableScale>
  );
}

// ─── Surfaces ─────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Fixed bar at the bottom of a screen for its main action, on a translucent material. */
export function BottomBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const content = <View style={[styles.bottomBarInner, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>{children}</View>;
  if (Platform.OS === "ios") {
    return (
      <BlurView tint="systemChromeMaterialLight" intensity={90} style={styles.bottomBar}>
        {content}
      </BlurView>
    );
  }
  return <View style={[styles.bottomBar, { backgroundColor: "rgba(255,255,255,0.96)" }]}>{content}</View>;
}

/** Height to leave at the end of a scroll view that sits above a BottomBar. */
export function useBottomBarSpace() {
  const insets = useSafeAreaInsets();
  return touch.button + space.md * 2 + Math.max(insets.bottom, space.lg);
}

// ─── People ───────────────────────────────────────────────────────────────
export function Avatar({ uri, name, size = 56 }: { uri?: string | null; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl(uri);
  const box = { width: size, height: size, borderRadius: size / 2, flexShrink: 0 };
  if (src && !failed) {
    return <Image source={{ uri: src }} onError={() => setFailed(true)} style={[box, { backgroundColor: colors.blush }]} accessibilityIgnoresInvertColors />;
  }
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? "?";
  return (
    <View style={[box, { backgroundColor: colors.blush, alignItems: "center", justifyContent: "center" }]}>
      <Text style={{ fontSize: size * 0.42, fontWeight: "700", color: colors.primaryText }}>{initial}</Text>
    </View>
  );
}

// ─── Tags ─────────────────────────────────────────────────────────────────
/** Interest tag. Read-only by default; pass onPress to make it a 44pt toggle. */
export function TagChip({ tag, selected = true, onPress }: { tag: Tag; selected?: boolean; onPress?: () => void }) {
  const tint = tag.color ? `#${tag.color}` : colors.brandPink;
  const chip = (
    <Animated.View
      style={[
        styles.chip,
        onPress && styles.chipToggle,
        {
          borderColor: tint,
          backgroundColor: selected ? `${tint}26` : colors.surface,
          transitionProperty: "backgroundColor",
          transitionDuration: motion.state,
          transitionTimingFunction: motion.easeOut,
        },
      ]}
    >
      {onPress && selected && <Icon name="check" size={15} color={colors.text} />}
      <T variant={onPress ? "subhead" : "footnote"} style={{ fontWeight: "600" }} color={selected ? colors.text : colors.secondaryText}>
        {tag.name}
      </T>
    </Animated.View>
  );
  if (!onPress) return chip;
  return (
    <PressableScale onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} accessibilityLabel={tag.name}>
      {chip}
    </PressableScale>
  );
}

export function TagList({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) return null;
  return (
    <View style={styles.wrap}>
      {tags.map((t) => (
        <TagChip key={t.id} tag={t} />
      ))}
    </View>
  );
}

// ─── Grouped list (iOS Settings style) ────────────────────────────────────
export function ListSection({ title, children, footer }: { title?: string; children: ReactNode; footer?: string }) {
  return (
    <View style={{ gap: space.sm }}>
      {title && (
        <T variant="footnote" color={colors.secondaryText} style={{ paddingHorizontal: space.lg, fontWeight: "600" }}>
          {title}
        </T>
      )}
      <View style={styles.listGroup}>{children}</View>
      {footer && (
        <T variant="footnote" color={colors.secondaryText} style={{ paddingHorizontal: space.lg }}>
          {footer}
        </T>
      )}
    </View>
  );
}

export function ListRow({
  label,
  value,
  icon,
  onPress,
  destructive,
  last,
}: {
  label: string;
  value?: string;
  icon?: IconName;
  onPress?: () => void;
  destructive?: boolean;
  last?: boolean;
}) {
  const color = destructive ? colors.danger : colors.text;
  const row = (
    <View style={[styles.listRow, !last && styles.listRowSeparator]}>
      {icon && <Icon name={icon} size={22} color={destructive ? colors.danger : colors.primaryText} />}
      <T variant="callout" color={color} style={{ flex: 1 }}>
        {label}
      </T>
      {value ? (
        <T variant="callout" color={colors.secondaryText} numberOfLines={1} style={{ flexShrink: 1 }}>
          {value}
        </T>
      ) : null}
      {onPress && !destructive && <Icon name="chevron" size={15} color={colors.secondaryText} />}
    </View>
  );
  if (!onPress) return row;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => pressed && { backgroundColor: colors.fill }}>
      {row}
    </Pressable>
  );
}

// ─── Screen states ────────────────────────────────────────────────────────
export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={[styles.center, { gap: space.lg }]}>
      <Icon name="warning" size={40} color={colors.danger} />
      <T style={{ textAlign: "center" }}>{message}</T>
      {onRetry && <Button title="Réessayer" variant="tinted" size="regular" onPress={onRetry} />}
    </View>
  );
}

export function Empty({ icon, title, text, action }: { icon: IconName; title: string; text?: string; action?: ReactNode }) {
  return (
    <View style={[styles.center, { gap: space.md, paddingVertical: space.xxxl * 2 }]}>
      <Icon name={icon} size={44} color={colors.brandPink} />
      <T variant="title2" style={{ textAlign: "center" }}>
        {title}
      </T>
      {text && (
        <T color={colors.secondaryText} style={{ textAlign: "center" }}>
          {text}
        </T>
      )}
      {action}
    </View>
  );
}

/** Small inline message under a field or button. */
export function InlineMessage({ text, tone = "error" }: { text: string; tone?: "error" | "success" }) {
  const color = tone === "error" ? colors.danger : colors.success;
  return (
    <View style={[styles.row, { gap: space.xs + 2 }]} accessibilityLiveRegion="polite">
      <Icon name={tone === "error" ? "warning" : "checkCircle"} size={16} color={color} />
      <T variant="footnote" color={color} style={{ flex: 1 }}>
        {text}
      </T>
    </View>
  );
}

// ─── Shared layout styles ─────────────────────────────────────────────────
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xxxl, gap: space.xxl },
  list: { paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.xxxl, gap: space.md },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: space.xxl, backgroundColor: colors.background },
  row: { flexDirection: "row", alignItems: "center", gap: space.md },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  section: { gap: space.md },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    borderRadius: radius.pill,
    paddingHorizontal: space.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    shadowColor: "#5B1A2E",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  bottomBarInner: { paddingHorizontal: space.xl, paddingTop: space.md },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    minHeight: 32,
  },
  chipToggle: { minHeight: touch.min, paddingHorizontal: space.lg },
  listGroup: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: "hidden" },
  listRow: { flexDirection: "row", alignItems: "center", gap: space.md, minHeight: 54, paddingHorizontal: space.lg, paddingVertical: space.md },
  listRowSeparator: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
});
