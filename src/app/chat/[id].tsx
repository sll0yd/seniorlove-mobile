import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/api/client";
import type { Message } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";
import { ErrorView, Loading, styles } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";
import { colors, font } from "@/theme";

const POLL_MS = 5000; // the back end has no live updates, so we check for new messages regularly

export default function ChatScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const otherId = Number(id);
  const { user: me } = useAuth();
  const insets = useSafeAreaInsets();
  const { data, setData, error, loading, reload } = useFetch(() => api.messages(otherId), [otherId]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    const timer = setInterval(() => reload(), POLL_MS);
    return () => clearInterval(timer);
  }, [reload]);

  async function send() {
    const content = text.trim();
    if (!content) return;
    setSending(true);
    try {
      const msg = await api.sendMessage(otherId, content);
      setData([...(data ?? []), msg]);
      setText("");
    } catch (e) {
      Alert.alert("Message non envoyé", e instanceof Error ? e.message : undefined);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={reload} />;

  const messages = [...(data ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at));

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen} keyboardVerticalOffset={insets.top + 44}>
      <Stack.Screen options={{ title: name ?? "Conversation" }} />
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={<Text style={[styles.body, { color: colors.muted, textAlign: "center", marginTop: 40 }]}>Dites bonjour 👋</Text>}
        renderItem={({ item }) => {
          const mine = item.sender_id === me?.id;
          return (
            <View
              style={{
                alignSelf: mine ? "flex-end" : "flex-start",
                maxWidth: "80%",
                backgroundColor: mine ? colors.primary : colors.card,
                borderRadius: 18,
                borderBottomRightRadius: mine ? 4 : 18,
                borderBottomLeftRadius: mine ? 18 : 4,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <Text style={{ fontSize: font.body, color: mine ? "#fff" : colors.text, lineHeight: 24 }}>{item.content}</Text>
              <Text style={{ fontSize: 12, marginTop: 4, color: mine ? "#ffe4e6" : colors.muted, alignSelf: "flex-end" }}>
                {new Date(item.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          );
        }}
      />
      <View style={{ flexDirection: "row", gap: 8, padding: 12, paddingBottom: 12 + insets.bottom, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}>
        <TextInput value={text} onChangeText={setText} placeholder="Votre message…" placeholderTextColor={colors.muted} multiline style={[styles.input, { flex: 1, maxHeight: 120, paddingVertical: 10 }]} />
        <Pressable
          onPress={send}
          disabled={sending || !text.trim()}
          accessibilityRole="button"
          accessibilityLabel="Envoyer"
          style={({ pressed }) => ({ backgroundColor: colors.primary, borderRadius: 24, paddingHorizontal: 18, justifyContent: "center", opacity: pressed || sending || !text.trim() ? 0.5 : 1 })}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: font.body }}>Envoyer</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
