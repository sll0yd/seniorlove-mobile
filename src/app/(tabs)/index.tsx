import { router } from "expo-router";
import { FlatList, Image, Pressable, RefreshControl, Text, View } from "react-native";
import { api } from "@/api/client";
import { Button, Card, Empty, ErrorView, Loading, TagChip, styles } from "@/components/ui";
import { imageUrl } from "@/config";
import { useFetch } from "@/hooks/useFetch";
import { colors } from "@/theme";

export default function EventsScreen() {
  const { data, error, loading, refreshing, refresh, reload } = useFetch(api.events);

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={reload} />;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={data ?? []}
      keyExtractor={(e) => String(e.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      ListHeaderComponent={<Button title="+ Proposer un événement" onPress={() => router.push("/events/new")} />}
      ListEmptyComponent={<Empty text="Aucun événement pour le moment." />}
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push(`/events/${item.id}`)} accessibilityRole="button" accessibilityLabel={item.title}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            {!!item.picture && <Image source={{ uri: imageUrl(item.picture) }} style={{ width: "100%", height: 170, backgroundColor: colors.blush }} />}
            <View style={{ padding: 16, gap: 6 }}>
              <Text style={styles.heading}>{item.title}</Text>
              <Text style={[styles.body, { color: colors.primaryDark, fontWeight: "600" }]}>
                {item.date} · {item.location}
              </Text>
              <Text style={styles.small}>Proposé par {item.creator.userName}</Text>
              {item.tags.length > 0 && (
                <View style={[styles.wrap, { marginTop: 6 }]}>
                  {item.tags.map((t) => (
                    <TagChip key={t.id} tag={t} />
                  ))}
                </View>
              )}
            </View>
          </Card>
        </Pressable>
      )}
    />
  );
}
