import { router, Stack } from "expo-router";
import { FlatList, RefreshControl } from "react-native";
import { api } from "@/api/client";
import { EventCard } from "@/components/EventCard";
import { HeaderButton } from "@/components/HeaderButton";
import { Button, Empty, ErrorView, Loading, styles } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";
import { colors } from "@/theme";

export default function EventsScreen() {
  const { data, error, loading, refreshing, refresh, reload } = useFetch(api.events);
  const propose = () => router.push("/events/new");

  return (
    <>
      <Stack.Screen options={{ headerRight: () => <HeaderButton title="Proposer" icon="plus" onPress={propose} bold /> }} />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorView message={error} onRetry={reload} />
      ) : (
        <FlatList
          style={styles.screen}
          contentContainerStyle={styles.list}
          contentInsetAdjustmentBehavior="automatic"
          data={data ?? []}
          keyExtractor={(e) => String(e.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <Empty
              icon="calendar"
              title="Aucun événement pour le moment"
              text="Proposez la première sortie !"
              action={<Button title="Proposer un événement" variant="tinted" size="regular" icon="plus" onPress={propose} />}
            />
          }
          renderItem={({ item }) => <EventCard event={item} />}
        />
      )}
    </>
  );
}
