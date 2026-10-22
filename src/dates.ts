// The back end stores event dates as text like "29/11/2024" or "2/02/2025".

export function parseEventDate(value: string): Date | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "29/11/2024" → "vendredi 29 novembre 2024" (falls back to the raw text). */
export function formatEventDate(value: string, style: "long" | "short" = "long"): string {
  const d = parseEventDate(value);
  if (!d) return value;
  const text = d.toLocaleDateString("fr-FR", style === "long" ? { weekday: "long", day: "numeric", month: "long", year: "numeric" } : { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Date → "29/11/2024", the format the back end expects. */
export function toEventDateString(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** Message timestamp: "14:05" today, "hier 14:05", otherwise "12 oct. 14:05". */
export function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return time;
  if (d.toDateString() === yesterday.toDateString()) return `hier ${time}`;
  return `${d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} ${time}`;
}
