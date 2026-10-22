import { useState } from "react";
import { Alert, KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import { api } from "@/api/client";
import type { Tag, User } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";
import { Avatar, Button, Card, ErrorView, Field, Loading, TagChip, styles } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { data, setData, error, loading, reload } = useFetch(async () => {
    const [me, tags] = await Promise.all([api.me(), api.tags()]);
    return { me, tags };
  });
  const [editing, setEditing] = useState(false);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorView message={error ?? "Profil introuvable."} onRetry={reload} />;

  const { me, tags } = data;
  const setMe = (next: User) => setData({ me: next, tags });

  async function toggleTag(tag: Tag) {
    const has = me.tags.some((t) => t.id === tag.id);
    // Update the screen right away, then tell the server.
    setMe({ ...me, tags: has ? me.tags.filter((t) => t.id !== tag.id) : [...me.tags, tag] });
    try {
      await (has ? api.removeTag(tag.id) : api.addTag(tag.id));
    } catch {
      reload();
    }
  }

  function confirmSignOut() {
    Alert.alert("Se déconnecter ?", undefined, [
      { text: "Annuler", style: "cancel" },
      { text: "Se déconnecter", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen} keyboardVerticalOffset={100}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: "center", gap: 8 }}>
          <Avatar uri={me.picture} name={me.userName} size={120} />
          <Text style={styles.title}>{me.userName}</Text>
          <Text style={styles.body}>
            {me.age} ans{me.hometown ? ` · ${me.hometown}` : ""}
          </Text>
        </View>

        {editing ? (
          <EditForm
            me={me}
            onCancel={() => setEditing(false)}
            onSaved={(next) => {
              setMe({ ...me, ...next });
              setEditing(false);
            }}
          />
        ) : (
          <>
            <Card style={{ gap: 8 }}>
              <Text style={styles.heading}>À propos de moi</Text>
              <Text style={styles.body}>{me.bio || "Vous n'avez pas encore écrit de présentation."}</Text>
            </Card>
            <Button title="Modifier mon profil" variant="outline" onPress={() => setEditing(true)} />
          </>
        )}

        <Card style={{ gap: 12 }}>
          <Text style={styles.heading}>Mes centres d'intérêt</Text>
          <Text style={styles.small}>Touchez pour ajouter ou retirer.</Text>
          <View style={styles.wrap}>
            {tags.map((t) => (
              <TagChip key={t.id} tag={t} selected={me.tags.some((m) => m.id === t.id)} onPress={() => toggleTag(t)} />
            ))}
          </View>
        </Card>

        <Button title="Se déconnecter" variant="danger" onPress={confirmSignOut} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function EditForm({ me, onCancel, onSaved }: { me: User; onCancel: () => void; onSaved: (u: Partial<User>) => void }) {
  const [userName, setUserName] = useState(me.userName);
  const [age, setAge] = useState(String(me.age));
  const [hometown, setHometown] = useState(me.hometown ?? "");
  const [bio, setBio] = useState(me.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const ageNumber = Number.parseInt(age, 10);
    if (!userName.trim() || Number.isNaN(ageNumber)) return setError("Merci d'indiquer un prénom et un âge valides.");
    setSaving(true);
    try {
      const changes = { userName: userName.trim(), age: ageNumber, hometown: hometown.trim(), bio: bio.trim() };
      await api.updateMe(changes);
      onSaved(changes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card style={{ gap: 14 }}>
      <Field label="Prénom" value={userName} onChangeText={setUserName} />
      <Field label="Âge" value={age} onChangeText={setAge} keyboardType="number-pad" maxLength={3} />
      <Field label="Ville" value={hometown} onChangeText={setHometown} />
      <Field label="Présentation" value={bio} onChangeText={setBio} multiline />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Button title="Enregistrer" onPress={save} loading={saving} />
      <Button title="Annuler" variant="outline" onPress={onCancel} />
    </Card>
  );
}
