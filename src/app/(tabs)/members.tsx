import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import { api } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { Avatar, Card, Empty, ErrorView, Loading, styles } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";
import { colors } from "@/theme";

export default function MembersScreen() {
  const { user: me } = useAuth();
  const { data, error, loading, refreshing, refresh, reload } = useFetch(api.users);
  const [query, setQuery] = useState("");

  const members = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? [])
      .filter((u) => u.id !== me?.id)
      .filter((u) => !q || [u.userName, u.hometown ?? "", ...u.tags.map((t) => t.name)].some((s) => s.toLowerCase().includes(q)));
  }, [data, query, me?.id]);

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={reload} />;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={members}
      keyExtractor={(u) => String(u.id)}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      ListHeaderComponent={
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher : prénom, ville, centre d'intérêt…"
          placeholderTextColor={colors.muted}
          style={styles.input}
          clearButtonMode="while-editing"
        />
      }
      ListEmptyComponent={<Empty text="Aucun membre trouvé." />}
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push(`/members/${item.id}`)} accessibilityRole="button" accessibilityLabel={item.userName}>
          <Card style={styles.row}>
            <Avatar uri={item.picture} name={item.userName} size={64} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.heading}>
                {item.userName}, {item.age} ans
              </Text>
              {item.hometown ? <Text style={styles.small}>{item.hometown}</Text> : null}
              {item.tags.length > 0 && <Text style={[styles.small, { color: colors.primaryDark }]}>{item.tags.map((t) => t.name).join(" · ")}</Text>}
            </View>
          </Card>
        </Pressable>
      )}
    />
  );
}
