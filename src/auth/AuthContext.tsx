import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setToken, setUnauthorizedHandler } from "@/api/client";
import type { LoginResponse } from "@/api/types";
import { storage } from "./storage";

const TOKEN_KEY = "seniorlove.token";
const USER_KEY = "seniorlove.user";

type SessionUser = LoginResponse["user"];

type AuthState = {
  isLoading: boolean;
  user: SessionUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { userName: string; email: string; password: string; age: number; gender: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);

  const signOut = useCallback(async () => {
    setToken(null);
    setUser(null);
    await storage.remove(TOKEN_KEY);
    await storage.remove(USER_KEY);
  }, []);

  // Restore a saved session when the app starts.
  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    (async () => {
      try {
        const savedToken = await storage.get(TOKEN_KEY);
        const savedUser = await storage.get(USER_KEY);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } finally {
        setIsLoading(false);
      }
    })();
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { accessToken, user } = await api.login(email.trim().toLowerCase(), password);
    setToken(accessToken);
    await storage.set(TOKEN_KEY, accessToken);
    await storage.set(USER_KEY, JSON.stringify(user));
    setUser(user);
  }, []);

  const signUp = useCallback<AuthState["signUp"]>(
    async (data) => {
      await api.signup({ ...data, email: data.email.trim().toLowerCase() });
      await signIn(data.email, data.password);
    },
    [signIn],
  );

  const value = useMemo(() => ({ isLoading, user, signIn, signUp, signOut }), [isLoading, user, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
