import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition, ReduceMotion } from "react-native-reanimated";
import { api } from "@/api/client";
import type { EventItem } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";
import { MetaLine } from "@/components/EventCard";
import { Icon } from "@/components/Icon";
import { Avatar, BottomBar, Button, Card, ErrorView, InlineMessage, Loading, PressableScale, styles, T, TagList, useBottomBarSpace } from "@/components/ui";
import { imageUrl } from "@/config";
import { formatEventDate } from "@/dates";
import { haptic } from "@/haptics";
import { useFetch } from "@/hooks/useFetch";
import { colors, space } from "@/theme";

// Layout animations are built once, at module scope. They follow the system "Reduce Motion" setting.
const ENTER = FadeIn.duration(180).reduceMotion(ReduceMotion.System);
const EXIT = FadeOut.duration(150).reduceMotion(ReduceMotion.System);
const REFLOW = LinearTransition.duration(200).reduceMotion(ReduceMotion.System);

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);
  const { user: me } = useAuth();
  const { data: event, setData, error, loading, reload } = useFetch(() => api.event(eventId), [eventId]);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const bottomSpace = useBottomBarSpace();

  if (loading) return <Loading />;
  if (error || !event) return <ErrorView message={error ?? "Événement introuvable."} onRetry={reload} />;

  const attendees = event.attendees ?? [];
  const isGoing = attendees.some((a) => a.id === me?.id);
  const isCreator = event.creator.id === me?.id;

  async function toggle() {
    if (!me || !event) return;
    const before: EventItem = event;
    // Update the screen immediately, then tell the server.
    setData({
      ...event,
      attendees: isGoing ? attendees.filter((a) => a.id !== me.id) : [...attendees, { id: me.id, userName: me.userName, picture: null }],
    });
    isGoing ? haptic.light() : haptic.success();
    setBusy(true);
    setActionError(null);
    try {
      await (isGoing ? api.leaveEvent(eventId) : api.joinEvent(eventId));
      reload();
    } catch (e) {
      setData(before);
      haptic.error();
      setActionError(e instanceof Error ? e.message : "Action impossible. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: "Événement" }} />
      <ScrollView contentContainerStyle={{ paddingBottom: bottomSpace + space.lg }}>
        {!!event.picture && (
          <Image source={{ uri: imageUrl(event.picture) }} style={{ width: "100%", aspectRatio: 16 / 10, backgroundColor: colors.blush }} accessibilityIgnoresInvertColors />
        )}

        <View style={styles.content}>
          <View style={styles.section}>
            <T variant="title" accessibilityRole="header">
              {event.title}
            </T>
            <View style={{ gap: space.sm }}>
              <MetaLine icon="calendar" text={formatEventDate(event.date)} strong />
              <MetaLine icon="location" text={event.location} strong />
            </View>
            <TagList tags={event.tags} />
          </View>

          <T>{event.description}</T>

          <PressableScale
            disabled={isCreator}
            onPress={() => router.push(`/members/${event.creator.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Organisé par ${isCreator ? "vous" : event.creator.userName}`}
          >
            <Card style={styles.row}>
              <Avatar uri={event.creator.picture} name={event.creator.userName} />
              <View style={{ flex: 1 }}>
                <T variant="footnote" color={colors.secondaryText}>
                  Organisé par
                </T>
                <T variant="headline">{isCreator ? "Vous" : event.creator.userName}</T>
              </View>
              {!isCreator && <Icon name="chevron" size={16} color={colors.secondaryText} />}
            </Card>
          </PressableScale>

          <View style={styles.section}>
            <T variant="title2" accessibilityRole="header">
              {attendees.length === 0 ? "Aucun participant pour l'instant" : `${attendees.length} participant${attendees.length > 1 ? "s" : ""}`}
            </T>
            <Animated.View layout={REFLOW} style={[styles.wrap, { gap: space.md }]}>
              {attendees.map((a) => {
                const isMe = a.id === me?.id;
                return (
                  <Animated.View key={a.id} entering={ENTER} exiting={EXIT} layout={REFLOW}>
                    <Pressable
                      disabled={isMe}
                      onPress={() => router.push(`/members/${a.id}`)}
                      accessibilityRole="button"
                      accessibilityLabel={isMe ? "Vous" : a.userName}
                      style={({ pressed }) => ({ alignItems: "center", width: 76, gap: space.xs, opacity: pressed ? 0.6 : 1 })}
                    >
                      <Avatar uri={a.picture} name={a.userName} size={60} />
                      <T variant="footnote" numberOfLines={1} style={isMe && { fontWeight: "600" }} color={isMe ? colors.primaryText : colors.text}>
                        {isMe ? "Vous" : a.userName}
                      </T>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </Animated.View>
          </View>
        </View>
      </ScrollView>

      {/* The main action stays in reach, whatever the scroll position. */}
      <BottomBar>
        <View style={{ gap: space.sm }}>
          {!!actionError && <InlineMessage text={actionError} />}
          {isGoing && !actionError && <InlineMessage tone="success" text="Vous participez à cet événement." />}
          <Button
            title={isGoing ? "Je ne participe plus" : "Je participe !"}
            variant={isGoing ? "tinted" : "filled"}
            icon={isGoing ? undefined : "heart"}
            onPress={toggle}
            disabled={busy}
          />
        </View>
      </BottomBar>
    </View>
  );
}
