import { router, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, ScrollView, TextInput, View } from "react-native";
import { api } from "@/api/client";
import { Field } from "@/components/Field";
import { HeaderButton } from "@/components/HeaderButton";
import { Button, ErrorView, InlineMessage, Loading, styles } from "@/components/ui";
import { haptic } from "@/haptics";
import { useFetch } from "@/hooks/useFetch";

export default function EditProfileScreen() {
  const { data: me, error: loadError, loading, reload } = useFetch(api.me);
  const ageRef = useRef<TextInput>(null);
  const hometownRef = useRef<TextInput>(null);
  const bioRef = useRef<TextInput>(null);

  const [userName, setUserName] = useState("");
  const [age, setAge] = useState("");
  const [hometown, setHometown] = useState("");
  const [bio, setBio] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fill the form once the current profile has loaded.
  const filled = useRef(false);
  useEffect(() => {
    if (me && !filled.current) {
      filled.current = true;
      setUserName(me.userName);
      setAge(String(me.age));
      setHometown(me.hometown ?? "");
      setBio(me.bio ?? "");
    }
  }, [me]);

  const ageNumber = Number.parseInt(age, 10);
  const nameError = submitted && !userName.trim() ? "Indiquez votre prénom." : null;
  const ageError = submitted && (Number.isNaN(ageNumber) || ageNumber < 18 || ageNumber > 120) ? "Indiquez un âge valide." : null;

  async function save() {
    setSubmitted(true);
    if (!userName.trim() || Number.isNaN(ageNumber) || ageNumber < 18 || ageNumber > 120) {
      haptic.error();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.updateMe({ userName: userName.trim(), age: ageNumber, hometown: hometown.trim(), bio: bio.trim() });
      haptic.success();
      router.back();
    } catch (e) {
      haptic.error();
      setError(e instanceof Error ? e.message : "Enregistrement impossible. Réessayez.");
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerLeft: () => <HeaderButton title="Annuler" onPress={() => router.back()} /> }} />
      {loading ? (
        <Loading />
      ) : loadError ? (
        <ErrorView message={loadError} onRetry={reload} />
      ) : (
        <KeyboardAvoidingView behavior="padding" style={styles.screen} keyboardVerticalOffset={60}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.section}>
              <Field
                label="Prénom"
                value={userName}
                onChangeText={setUserName}
                error={nameError}
                returnKeyType="next"
                onSubmitEditing={() => ageRef.current?.focus()}
                submitBehavior="submit"
              />
              <Field
                ref={ageRef}
                label="Âge"
                value={age}
                onChangeText={(v) => setAge(v.replace(/\D/g, ""))}
                error={ageError}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Field
                ref={hometownRef}
                label="Ville"
                value={hometown}
                onChangeText={setHometown}
                textContentType="addressCity"
                returnKeyType="next"
                onSubmitEditing={() => bioRef.current?.focus()}
                submitBehavior="submit"
              />
              <Field ref={bioRef} label="Présentation" value={bio} onChangeText={setBio} multiline placeholder="Quelques mots sur vous, vos passions…" />
            </View>
            <View style={styles.section}>
              {!!error && <InlineMessage text={error} />}
              <Button title="Enregistrer" onPress={save} loading={saving} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </>
  );
}
