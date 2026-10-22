import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// On iOS/Android the login token goes in the device keychain (SecureStore).
// SecureStore doesn't exist in a web browser, so the web preview falls back to localStorage.
const isWeb = Platform.OS === "web";

export const storage = {
  get: (key: string) => (isWeb ? Promise.resolve(localStorage.getItem(key)) : SecureStore.getItemAsync(key)),
  set: (key: string, value: string) => (isWeb ? Promise.resolve(localStorage.setItem(key, value)) : SecureStore.setItemAsync(key, value)),
  remove: (key: string) => (isWeb ? Promise.resolve(localStorage.removeItem(key)) : SecureStore.deleteItemAsync(key)),
};
