import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { api } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { Avatar, Button, Card, ErrorView, Loading, TagChip, styles } from "@/components/ui";
import { imageUrl } from "@/config";
import { useFetch } from "@/hooks/useFetch";
import { colors } from "@/theme";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);
  const { user: me } = useAuth();
  const { data: event, error, loading, reload } = useFetch(() => api.event(eventId), [eventId]);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading) return <Loading />;
  if (error || !event) return <ErrorView message={error ?? "Événement introuvable."} onRetry={reload} />;

  const attendees = event.attendees ?? [];
  const isGoing = attendees.some((a) => a.id === me?.id);
  const isCreator = event.creator.id === me?.id;

  async function toggle() {
    setBusy(true);
    setActionError(null);
    try {
      await (isGoing ? api.leaveEvent(eventId) : api.joinEvent(eventId));
      await reload();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      {!!event.picture && <Image source={{ uri: imageUrl(event.picture) }} style={{ width: "100%", height: 240, backgroundColor: colors.blush }} />}
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={[styles.body, { color: colors.primaryDark, fontWeight: "700" }]}>
          📅 {event.date}   📍 {event.location}
        </Text>
        {event.tags.length > 0 && (
          <View style={styles.wrap}>
            {event.tags.map((t) => (
              <TagChip key={t.id} tag={t} />
            ))}
          </View>
        )}
        <Text style={styles.body}>{event.description}</Text>

        <Pressable onPress={() => !isCreator && router.push(`/members/${event.creator.id}`)}>
          <Card style={styles.row}>
            <Avatar uri={event.creator.picture} name={event.creator.userName} />
            <View>
              <Text style={styles.small}>Organisé par</Text>
              <Text style={styles.heading}>{isCreator ? "Vous" : event.creator.userName}</Text>
            </View>
          </Card>
        </Pressable>

        <Button title={isGoing ? "Je ne participe plus" : "Je participe !"} variant={isGoing ? "outline" : "primary"} onPress={toggle} loading={busy} />
        {!!actionError && <Text style={styles.error}>{actionError}</Text>}

        <Text style={styles.heading}>
          {attendees.length} participant{attendees.length > 1 ? "s" : ""}
        </Text>
        <View style={styles.wrap}>
          {attendees.map((a) => (
            <Pressable key={a.id} onPress={() => a.id !== me?.id && router.push(`/members/${a.id}`)} style={{ alignItems: "center", width: 76, gap: 4 }}>
              <Avatar uri={a.picture} name={a.userName} size={60} />
              <Text style={styles.small} numberOfLines={1}>
                {a.id === me?.id ? "Vous" : a.userName}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
