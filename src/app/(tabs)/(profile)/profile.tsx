import { router } from "expo-router";
import { Alert, ScrollView, View } from "react-native";
import { api } from "@/api/client";
import type { Tag, User } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";
import { Avatar, Card, ErrorView, ListRow, ListSection, Loading, styles, T, TagChip } from "@/components/ui";
import { haptic } from "@/haptics";
import { useFetch } from "@/hooks/useFetch";
import { colors, space } from "@/theme";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { data, setData, error, loading, reload } = useFetch(async () => {
    const [me, tags] = await Promise.all([api.me(), api.tags()]);
    return { me, tags };
  });

  if (loading) return <Loading />;
  if (error || !data) return <ErrorView message={error ?? "Profil introuvable."} onRetry={reload} />;

  const { me, tags } = data;
  const setMe = (next: User) => setData({ me: next, tags });

  async function toggleTag(tag: Tag) {
    const has = me.tags.some((t) => t.id === tag.id);
    // Update the screen right away, then tell the server.
    haptic.selection();
    setMe({ ...me, tags: has ? me.tags.filter((t) => t.id !== tag.id) : [...me.tags, tag] });
    try {
      await (has ? api.removeTag(tag.id) : api.addTag(tag.id));
    } catch {
      haptic.error();
      reload();
    }
  }

  function confirmSignOut() {
    Alert.alert("Se déconnecter ?", "Vous pourrez vous reconnecter à tout moment avec votre email et votre mot de passe.", [
      { text: "Annuler", style: "cancel" },
      { text: "Se déconnecter", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <View style={{ alignItems: "center", gap: space.sm }}>
        <Avatar uri={me.picture} name={me.userName} size={112} />
        <T variant="title" style={{ textAlign: "center" }}>
          {me.userName}
        </T>
        <T color={colors.secondaryText}>
          {me.age} ans{me.hometown ? ` · ${me.hometown}` : ""}
        </T>
      </View>

      <Card style={styles.section}>
        <T variant="headline" accessibilityRole="header">
          À propos de moi
        </T>
        <T color={me.bio ? colors.text : colors.secondaryText}>{me.bio || "Vous n'avez pas encore écrit de présentation."}</T>
      </Card>

      <Card style={styles.section}>
        <View style={{ gap: space.xs }}>
          <T variant="headline" accessibilityRole="header">
            Mes centres d'intérêt
          </T>
          <T variant="footnote" color={colors.secondaryText}>
            Touchez pour ajouter ou retirer.
          </T>
        </View>
        <View style={styles.wrap}>
          {tags.map((t) => (
            <TagChip key={t.id} tag={t} selected={me.tags.some((m) => m.id === t.id)} onPress={() => toggleTag(t)} />
          ))}
        </View>
      </Card>

      <ListSection>
        <ListRow icon="edit" label="Modifier mon profil" onPress={() => router.push("/edit-profile")} last />
      </ListSection>

      <ListSection>
        <ListRow icon="logout" label="Se déconnecter" destructive onPress={confirmSignOut} last />
      </ListSection>
    </ScrollView>
  );
}
