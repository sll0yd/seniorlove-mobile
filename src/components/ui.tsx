import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import type { Tag } from "@/api/types";
import { imageUrl } from "@/config";
import { colors, font, radius } from "@/theme";

export function Button({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "danger";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const outline = variant === "outline";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        outline && styles.buttonOutline,
        variant === "danger" && { backgroundColor: colors.danger },
        (pressed || disabled) && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? colors.primary : "#fff"} />
      ) : (
        <Text style={[styles.buttonText, outline && { color: colors.primaryDark }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} {...props} style={[styles.input, props.multiline && { minHeight: 110, textAlignVertical: "top" }, props.style]} />
    </View>
  );
}

export function Avatar({ uri, name, size = 56 }: { uri?: string | null; name: string; size?: number }) {
  const src = imageUrl(uri);
  if (src) return <Image source={{ uri: src }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.blush }} />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.blush, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: size * 0.42, fontWeight: "700", color: colors.primaryDark }}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

export function TagChip({ tag, selected, onPress }: { tag: Tag; selected?: boolean; onPress?: () => void }) {
  const tint = tag.color ? `#${tag.color}` : colors.primary;
  const active = selected ?? true;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "checkbox" : undefined}
      accessibilityState={onPress ? { checked: active } : undefined}
      style={[styles.chip, { borderColor: tint, backgroundColor: active ? `${tint}22` : "transparent" }]}
    >
      <Text style={[styles.chipText, { color: active ? colors.text : colors.muted }]}>
        {onPress && active ? "✓ " : ""}
        {tag.name}
      </Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={[styles.center, { gap: 16 }]}>
      <Text style={[styles.body, { textAlign: "center" }]}>{message}</Text>
      {onRetry && <Button title="Réessayer" variant="outline" onPress={onRetry} />}
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <View style={styles.center}>
      <Text style={[styles.body, { color: colors.muted, textAlign: "center" }]}>{text}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: colors.background },
  title: { fontSize: font.title, fontWeight: "800", color: colors.text },
  heading: { fontSize: font.heading, fontWeight: "700", color: colors.text },
  body: { fontSize: font.body, color: colors.text, lineHeight: 26 },
  small: { fontSize: font.small, color: colors.muted },
  label: { fontSize: font.small, fontWeight: "600", color: colors.text },
  input: {
    fontSize: font.body,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
  },
  button: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  buttonOutline: { backgroundColor: "transparent", borderWidth: 2, borderColor: colors.primary },
  buttonText: { color: "#fff", fontSize: font.body, fontWeight: "700" },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  chip: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: font.small, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  error: { color: colors.danger, fontSize: font.small },
});
