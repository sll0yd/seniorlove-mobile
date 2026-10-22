// Where the Senior Love back end lives.
//
// The iOS Simulator shares your Mac's network, so "localhost" works as-is.
// On a real phone, set EXPO_PUBLIC_API_URL in a .env file to your Mac's
// local IP address, e.g. EXPO_PUBLIC_API_URL=http://192.168.1.20:3000
export const SERVER_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const API_URL = `${SERVER_URL}/api`;

// The back end stores picture URLs as "http://localhost:3000/uploads/...".
// Rewrite them so they point at the same server the app is talking to.
export function imageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  return url.replace(/^https?:\/\/localhost:3000/, SERVER_URL);
}
