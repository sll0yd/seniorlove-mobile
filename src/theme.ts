import type { TextStyle } from "react-native";

// ─── Colours ──────────────────────────────────────────────────────────────
// Senior Love's rose palette, tuned so every text/background pair passes
// WCAG AA (4.5:1). The light pinks are only ever used *behind* text, never as
// the colour of text or of a filled button.
export const colors = {
  primary: "#E11D48", // rose-600 — filled buttons, my chat bubbles (white text 4.7:1)
  primaryText: "#BE123C", // rose-700 — links, tinted buttons, accents on light backgrounds (5.8:1)
  primaryTint: "#FFE4E6", // rose-100 — tinted button / selected backgrounds
  brandPink: "#FB7185", // rose-400 — decorative accents only (never behind text)
  blush: "#F2BBB7", // custom-pink from the web app — avatar placeholders
  teal: "#4EC5CA", // custom-blue from the web app

  background: "#FDF2F8", // pink-50
  surface: "#FFFFFF",
  fill: "#F6E7EC", // search field, inputs at rest
  separator: "rgba(60, 20, 35, 0.12)",

  text: "#1F2937",
  secondaryText: "#525A66", // 6.4:1 on background
  danger: "#B91C1C", // 6.5:1 on white
  success: "#15803D",
};

// ─── Spacing (4pt grid) ───────────────────────────────────────────────────
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20, // screen side margin
  xxl: 24, // gap between sections
  xxxl: 32,
};

export const radius = {
  sm: 10,
  md: 14, // inputs
  lg: 18, // cards
  pill: 999, // buttons, chips
};

// Minimum touch target (Apple HIG: 44pt). Primary buttons are taller for seniors.
export const touch = { min: 44, button: 56 };

// ─── Typography ───────────────────────────────────────────────────────────
// One scale for the whole app. Sizes start larger than iOS defaults because the
// audience is 60+, and they still grow with the user's Dynamic Type setting.
// Big text gets slightly negative tracking and tight leading; small text gets
// a touch of positive tracking and looser leading.
export const type = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: "700", letterSpacing: -0.4 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: "700", letterSpacing: -0.3 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: "700", letterSpacing: -0.2 },
  headline: { fontSize: 19, lineHeight: 25, fontWeight: "600", letterSpacing: -0.1 },
  body: { fontSize: 18, lineHeight: 26, fontWeight: "400", letterSpacing: 0 },
  callout: { fontSize: 17, lineHeight: 23, fontWeight: "400", letterSpacing: 0 },
  subhead: { fontSize: 16, lineHeight: 22, fontWeight: "400", letterSpacing: 0 },
  footnote: { fontSize: 15, lineHeight: 20, fontWeight: "400", letterSpacing: 0.1 },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "500", letterSpacing: 0.2 },
  button: { fontSize: 18, lineHeight: 22, fontWeight: "600", letterSpacing: 0 },
} satisfies Record<string, TextStyle>;

// ─── Motion ───────────────────────────────────────────────────────────────
// Short and never bouncy: these are state changes, not gestures.
export const motion = {
  press: 120, // ms, press feedback
  state: 180, // ms, toggles / chips / small state changes
  easeOut: "cubic-bezier(0.23, 1, 0.32, 1)",
};
