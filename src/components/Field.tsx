import { forwardRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { colors, radius, space, touch, type } from "@/theme";
import { Icon } from "./Icon";
import { InlineMessage, T } from "./ui";

type FieldProps = TextInputProps & {
  label: string;
  /** Shown under the field. Pass it only once the person has left the field or tried to submit. */
  error?: string | null;
  hint?: string;
};

// A labelled text field with its error right underneath it.
// Password fields get a show/hide button.
export const Field = forwardRef<TextInput, FieldProps>(function Field({ label, error, hint, secureTextEntry, style, ...props }, ref) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const isPassword = !!secureTextEntry;

  return (
    <View style={{ gap: space.sm }}>
      <T variant="subhead" style={{ fontWeight: "600" }}>
        {label}
      </T>
      <View
        style={[
          styles.box,
          focused && { borderColor: colors.primaryText, backgroundColor: colors.surface },
          !!error && { borderColor: colors.danger },
          props.multiline && { alignItems: "flex-start" },
        ]}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={colors.secondaryText}
          {...props}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          secureTextEntry={isPassword && hidden}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[styles.input, props.multiline && styles.multiline, style]}
        />
        {isPassword && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            style={styles.eye}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Afficher le mot de passe" : "Masquer le mot de passe"}
          >
            <Icon name={hidden ? "eye" : "eyeOff"} size={22} color={colors.secondaryText} />
          </Pressable>
        )}
      </View>
      {error ? (
        <InlineMessage text={error} />
      ) : hint ? (
        <T variant="footnote" color={colors.secondaryText}>
          {hint}
        </T>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: touch.button,
    backgroundColor: colors.fill,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  input: {
    ...type.body,
    flex: 1,
    color: colors.text,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  multiline: { minHeight: 130, textAlignVertical: "top", paddingTop: space.md },
  eye: { width: touch.min, height: touch.min, alignItems: "center", justifyContent: "center", marginRight: space.xs },
});
