import { router, Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { api } from "@/api/client";
import { Avatar, BottomBar, Button, Card, ErrorView, Loading, styles, T, TagList, useBottomBarSpace } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";
import { colors, space } from "@/theme";

export default function MemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = Number(id);
  const { data: user, error, loading, reload } = useFetch(() => api.user(userId), [userId]);
  const bottomSpace = useBottomBarSpace();

  if (loading) return <Loading />;
  if (error || !user) return <ErrorView message={error ?? "Profil introuvable."} onRetry={reload} />;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: user.userName }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomSpace + space.lg }]}>
        <View style={{ alignItems: "center", gap: space.sm }}>
          <Avatar uri={user.picture} name={user.userName} size={128} />
          <T variant="title" style={{ textAlign: "center" }} accessibilityRole="header">
            {user.userName}
          </T>
          <T color={colors.secondaryText}>
            {user.age} ans{user.hometown ? ` · ${user.hometown}` : ""}
          </T>
        </View>

        {user.bio ? (
          <Card style={styles.section}>
            <T variant="headline" accessibilityRole="header">
              À propos
            </T>
            <T>{user.bio}</T>
          </Card>
        ) : null}

        {user.tags.length > 0 && (
          <Card style={styles.section}>
            <T variant="headline" accessibilityRole="header">
              Centres d'intérêt
            </T>
            <TagList tags={user.tags} />
          </Card>
        )}
      </ScrollView>

      <BottomBar>
        <Button
          title={`Écrire à ${user.userName}`}
          icon="chat"
          onPress={() => router.push({ pathname: "/chat/[id]", params: { id: user.id, name: user.userName } })}
        />
      </BottomBar>
    </View>
  );
}
