import { router } from "expo-router";
import { Image, View } from "react-native";
import type { EventItem } from "@/api/types";
import { imageUrl } from "@/config";
import { formatEventDate } from "@/dates";
import { colors, space } from "@/theme";
import { Icon, type IconName } from "./Icon";
import { Card, PressableScale, T, TagList } from "./ui";

export function MetaLine({ icon, text, strong }: { icon: IconName; text: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
      <Icon name={icon} size={18} color={colors.primaryText} />
      <T variant="callout" color={strong ? colors.text : colors.secondaryText} style={[{ flex: 1 }, strong && { fontWeight: "600" }]}>
        {text}
      </T>
    </View>
  );
}

export function EventCard({ event }: { event: EventItem }) {
  return (
    <PressableScale
      onPress={() => router.push(`/events/${event.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${formatEventDate(event.date)}, ${event.location}`}
    >
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {!!event.picture && (
          <Image source={{ uri: imageUrl(event.picture) }} style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: colors.blush }} accessibilityIgnoresInvertColors />
        )}
        <View style={{ padding: space.lg, gap: space.sm }}>
          <T variant="title2">{event.title}</T>
          <View style={{ gap: space.xs }}>
            <MetaLine icon="calendar" text={formatEventDate(event.date)} strong />
            <MetaLine icon="location" text={event.location} />
          </View>
          <T variant="footnote" color={colors.secondaryText}>
            Proposé par {event.creator.userName}
          </T>
          {event.tags.length > 0 && (
            <View style={{ marginTop: space.xs }}>
              <TagList tags={event.tags} />
            </View>
          )}
        </View>
      </Card>
    </PressableScale>
  );
}
