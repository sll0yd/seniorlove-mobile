import { API_URL } from "@/config";
import type { EventItem, LoginResponse, Message, Tag, User, UserSummary } from "./types";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// The token is kept here so every request can send it,
// the same way the web app's axios interceptor does.
let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setToken(value: string | null) {
  token = value;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Impossible de joindre le serveur. Vérifiez que le back end est lancé.");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // An expired or invalid token on a protected route: log the user out.
    if (res.status === 401 && token && path !== "/login") onUnauthorized?.();
    const message = (data && (data.error?.issues?.[0]?.message ?? data.error ?? data.message)) || "Une erreur est survenue.";
    throw new ApiError(res.status, typeof message === "string" ? message : "Une erreur est survenue.");
  }
  return data as T;
}

// Some list endpoints answer 404 when there is nothing yet; treat that as an empty list.
async function listOrEmpty<T>(path: string): Promise<T[]> {
  try {
    return await request<T[]>(path);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return [];
    throw e;
  }
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<LoginResponse>("/login", { method: "POST", body: { email, password } }),
  signup: (data: { userName: string; email: string; password: string; age: number; gender: string }) =>
    request<{ message: string }>("/signup", { method: "POST", body: data }),

  // Public lists
  events: () => request<EventItem[]>("/events"),
  event: (id: number) => request<EventItem>(`/events/${id}`),
  users: () => request<User[]>("/users"),
  user: (id: number) => request<User>(`/users/${id}`),
  tags: () => request<Tag[]>("/tags"),

  // My account
  me: () => request<User>("/me"),
  updateMe: (data: Partial<Pick<User, "userName" | "age" | "hometown" | "bio">>) =>
    request<User>("/me", { method: "PATCH", body: data }),
  addTag: (tagId: number) => request(`/me/tags/${tagId}`, { method: "POST" }),
  removeTag: (tagId: number) => request(`/me/tags/${tagId}`, { method: "DELETE" }),

  // Events
  createEvent: (data: { title: string; description: string; date: string; location: string }) =>
    request<EventItem>("/me/events", { method: "POST", body: data }),
  joinEvent: (id: number) => request(`/me/events/join/${id}`, { method: "POST" }),
  leaveEvent: (id: number) => request(`/me/events/join/${id}`, { method: "DELETE" }),

  // Messages
  contacts: () => listOrEmpty<UserSummary>("/me/contacts"),
  messages: (userId: number) => listOrEmpty<Message>(`/me/messages/${userId}`),
  sendMessage: (userId: number, content: string) =>
    request<Message>(`/me/messages/${userId}`, { method: "POST", body: { content } }),
};
