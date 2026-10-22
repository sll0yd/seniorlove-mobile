import { Stack, useLocalSearchParams } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { Icon } from "@/components/Icon";
import { ErrorView, Loading, styles, T } from "@/components/ui";
import { formatMessageTime } from "@/dates";
import { haptic } from "@/haptics";
import { useFetch } from "@/hooks/useFetch";
import { colors, radius, space, touch, type } from "@/theme";

const POLL_MS = 5000; // the back end has no live updates, so we check for new messages regularly

type Bubble = { key: string; mine: boolean; content: string; time: string; status?: "sending" | "failed" };
type Pending = { key: string; content: string; status: "sending" | "failed" };

export default function ChatScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const otherId = Number(id);
  const { user: me } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { data, setData, error, loading, reload } = useFetch(() => api.messages(otherId), [otherId]);
  const [text, setText] = useState("");
  const [pending, setPending] = useState<Pending[]>([]);
  const listRef = useRef<FlatList<Bubble>>(null);

  useEffect(() => {
    const timer = setInterval(() => reload(), POLL_MS);
    return () => clearInterval(timer);
  }, [reload]);

  const bubbles = useMemo<Bubble[]>(() => {
    const sent = [...(data ?? [])]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((m) => ({ key: String(m.id), mine: m.sender_id === me?.id, content: m.content, time: formatMessageTime(m.created_at) }));
    return [...sent, ...pending.map((p) => ({ key: p.key, mine: true, content: p.content, time: "", status: p.status }))];
  }, [data, pending, me?.id]);

  // Only jump to the bottom when a message is added, not on every 5-second refresh.
  const count = useRef(0);
  useEffect(() => {
    if (bubbles.length !== count.current) {
      const animated = count.current !== 0;
      count.current = bubbles.length;
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated }));
    }
  }, [bubbles.length]);

  async function deliver(item: Pending) {
    setPending((p) => p.map((x) => (x.key === item.key ? { ...x, status: "sending" } : x)));
    try {
      const msg = await api.sendMessage(otherId, item.content);
      setPending((p) => p.filter((x) => x.key !== item.key));
      setData((prev) => [...(prev ?? []), msg]);
    } catch {
      haptic.error();
      setPending((p) => p.map((x) => (x.key === item.key ? { ...x, status: "failed" } : x)));
    }
  }

  function send() {
    const content = text.trim();
    if (!content) return;
    // The message appears straight away; the server confirms in the background.
    const item: Pending = { key: `pending-${Date.now()}`, content, status: "sending" };
    setPending((p) => [...p, item]);
    setText("");
    haptic.light();
    deliver(item);
  }

  if (loading) return <Loading />;
  if (error && !data) return <ErrorView message={error} onRetry={reload} />;

  const canSend = text.trim().length > 0;

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen} keyboardVerticalOffset={headerHeight}>
      <Stack.Screen options={{ title: name ?? "Conversation" }} />
      <FlatList
        ref={listRef}
        data={bubbles}
        keyExtractor={(m) => m.key}
        contentContainerStyle={{ padding: space.lg, gap: space.sm, flexGrow: 1 }}
        keyboardDismissMode="interactive"
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: space.sm }}>
            <Icon name="chat" size={40} color={colors.brandPink} />
            <T color={colors.secondaryText} style={{ textAlign: "center" }}>
              Dites bonjour à {name ?? "ce membre"} 👋
            </T>
          </View>
        }
        renderItem={({ item }) => <MessageBubble bubble={item} onRetry={() => item.status === "failed" && deliver({ key: item.key, content: item.content, status: "failed" })} />}
      />

      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: space.sm, paddingHorizontal: space.md, paddingTop: space.sm, paddingBottom: Math.max(insets.bottom, space.sm), borderTopWidth: 1, borderColor: colors.separator, backgroundColor: colors.surface }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Votre message…"
          placeholderTextColor={colors.secondaryText}
          multiline
          accessibilityLabel="Votre message"
          style={[type.body, { flex: 1, maxHeight: 140, minHeight: touch.min, color: colors.text, backgroundColor: colors.fill, borderRadius: radius.lg, paddingHorizontal: space.lg, paddingTop: space.sm + 2, paddingBottom: space.sm + 2 }]}
        />
        <Pressable
          onPress={send}
          disabled={!canSend}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Envoyer"
          style={({ pressed }) => ({ width: touch.min, height: touch.min, alignItems: "center", justifyContent: "center", opacity: !canSend ? 0.35 : pressed ? 0.6 : 1 })}
        >
          <Icon name="send" size={40} color={colors.primary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ bubble, onRetry }: { bubble: Bubble; onRetry: () => void }) {
  const { mine, content, time, status } = bubble;
  return (
    <View style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "82%", gap: 2 }}>
      <View
        style={{
          backgroundColor: mine ? colors.primary : colors.surface,
          borderRadius: radius.lg,
          borderBottomRightRadius: mine ? space.xs : radius.lg,
          borderBottomLeftRadius: mine ? radius.lg : space.xs,
          paddingHorizontal: space.md + 2,
          paddingVertical: space.sm + 2,
          opacity: status === "sending" ? 0.75 : 1,
        }}
      >
        <T color={mine ? "#FFFFFF" : colors.text}>{content}</T>
        {!!time && (
          <T variant="caption" color={mine ? "#FFFFFF" : colors.secondaryText} style={{ alignSelf: "flex-end", marginTop: 2 }}>
            {time}
          </T>
        )}
      </View>
      {status === "sending" && (
        <T variant="caption" color={colors.secondaryText} style={{ alignSelf: "flex-end" }}>
          Envoi…
        </T>
      )}
      {status === "failed" && (
        <Pressable onPress={onRetry} accessibilityRole="button" hitSlop={8} style={{ alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: space.xs, minHeight: 32 }}>
          <Icon name="warning" size={14} color={colors.danger} />
          <T variant="footnote" color={colors.danger} style={{ fontWeight: "600" }}>
            Non envoyé · Toucher pour réessayer
          </T>
        </Pressable>
      )}
    </View>
  );
}
