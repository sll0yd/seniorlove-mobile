import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, ScrollView, Text } from "react-native";
import { api } from "@/api/client";
import { Button, Field, styles } from "@/components/ui";

export default function NewEventScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!title.trim() || !description.trim() || !date.trim() || !location.trim()) {
      return setError("Merci de remplir tous les champs.");
    }
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date.trim())) return setError("La date doit être au format JJ/MM/AAAA.");

    setSaving(true);
    setError(null);
    try {
      const event = await api.createEvent({ title: title.trim(), description: description.trim(), date: date.trim(), location: location.trim() });
      router.replace(`/events/${event.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Création impossible.");
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen} keyboardVerticalOffset={60}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="Titre" value={title} onChangeText={setTitle} placeholder="Ex. : Balade au bord du lac" />
        <Field label="Date (JJ/MM/AAAA)" value={date} onChangeText={setDate} placeholder="15/11/2026" keyboardType="numbers-and-punctuation" />
        <Field label="Lieu" value={location} onChangeText={setLocation} placeholder="Ville" />
        <Field label="Description" value={description} onChangeText={setDescription} multiline placeholder="Racontez ce que vous proposez…" />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button title="Publier l'événement" onPress={submit} loading={saving} />
        <Button title="Annuler" variant="outline" onPress={() => router.back()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
