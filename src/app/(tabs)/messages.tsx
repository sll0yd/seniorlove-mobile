import { router } from "expo-router";
import { FlatList, Pressable, RefreshControl, Text } from "react-native";
import { api } from "@/api/client";
import { Avatar, Card, Empty, ErrorView, Loading, styles } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";
import { colors } from "@/theme";

export default function MessagesScreen() {
  const { data, error, loading, refreshing, refresh, reload } = useFetch(api.contacts);

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={reload} />;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.content, { flexGrow: 1 }]}
      data={data ?? []}
      keyExtractor={(u) => String(u.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      ListEmptyComponent={<Empty text={"Pas encore de conversation.\nÉcrivez à un membre depuis son profil !"} />}
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id, name: item.userName } })} accessibilityRole="button">
          <Card style={styles.row}>
            <Avatar uri={item.picture} name={item.userName} />
            <Text style={[styles.heading, { flex: 1 }]}>{item.userName}</Text>
            <Text style={[styles.heading, { color: colors.muted }]}>›</Text>
          </Card>
        </Pressable>
      )}
    />
  );
}
