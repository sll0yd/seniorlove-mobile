import { router } from "expo-router";
import { FlatList, RefreshControl } from "react-native";
import { api } from "@/api/client";
import { PersonRow } from "@/components/PersonRow";
import { Button, Empty, ErrorView, Loading, styles } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";
import { colors } from "@/theme";

export default function MessagesScreen() {
  const { data, error, loading, refreshing, refresh, reload } = useFetch(api.contacts);

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={reload} />;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.list, { flexGrow: 1 }]}
      contentInsetAdjustmentBehavior="automatic"
      data={data ?? []}
      keyExtractor={(u) => String(u.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      ListEmptyComponent={
        <Empty
          icon="chat"
          title="Pas encore de conversation"
          text="Écrivez à un membre depuis son profil."
          action={<Button title="Voir les membres" variant="tinted" size="regular" icon="people" onPress={() => router.navigate("/members")} />}
        />
      }
      renderItem={({ item }) => (
        <PersonRow
          name={item.userName}
          picture={item.picture}
          title={item.userName}
          subtitle="Ouvrir la conversation"
          accessibilityLabel={`Conversation avec ${item.userName}`}
          onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id, name: item.userName } })}
        />
      )}
    />
  );
}
