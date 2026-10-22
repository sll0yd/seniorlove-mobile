import { router, Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { api } from "@/api/client";
import { Avatar, Button, Card, ErrorView, Loading, TagChip, styles } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";

export default function MemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = Number(id);
  const { data: user, error, loading, reload } = useFetch(() => api.user(userId), [userId]);

  if (loading) return <Loading />;
  if (error || !user) return <ErrorView message={error ?? "Profil introuvable."} onRetry={reload} />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: user.userName }} />
      <View style={{ alignItems: "center", gap: 8 }}>
        <Avatar uri={user.picture} name={user.userName} size={140} />
        <Text style={styles.title}>{user.userName}</Text>
        <Text style={styles.body}>
          {user.age} ans{user.hometown ? ` · ${user.hometown}` : ""}
        </Text>
      </View>

      <Button
        title={`Écrire à ${user.userName}`}
        onPress={() => router.push({ pathname: "/chat/[id]", params: { id: user.id, name: user.userName } })}
      />

      {user.bio ? (
        <Card style={{ gap: 8 }}>
          <Text style={styles.heading}>À propos</Text>
          <Text style={styles.body}>{user.bio}</Text>
        </Card>
      ) : null}

      {user.tags.length > 0 && (
        <Card style={{ gap: 12 }}>
          <Text style={styles.heading}>Centres d'intérêt</Text>
          <View style={styles.wrap}>
            {user.tags.map((t) => (
              <TagChip key={t.id} tag={t} />
            ))}
          </View>
        </Card>
      )}
    </ScrollView>
  );
}
