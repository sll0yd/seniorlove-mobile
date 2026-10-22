import DateTimePicker from "@react-native-community/datetimepicker";
import { router, Stack } from "expo-router";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from "react-native";
import { api } from "@/api/client";
import { Field } from "@/components/Field";
import { HeaderButton } from "@/components/HeaderButton";
import { Icon } from "@/components/Icon";
import { Button, InlineMessage, styles, T } from "@/components/ui";
import { formatEventDate, parseEventDate, toEventDateString } from "@/dates";
import { haptic } from "@/haptics";
import { colors, radius, space, touch } from "@/theme";

type Key = "title" | "location" | "description" | "date";

export default function NewEventScreen() {
  const locationRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  });
  const [dateText, setDateText] = useState(""); // web fallback only
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const native = Platform.OS === "ios" || Platform.OS === "android";
  const dateValue = native ? toEventDateString(date) : dateText.trim();
  const problems: Record<Key, string | null> = {
    title: !title.trim() ? "Donnez un titre à votre événement." : null,
    location: !location.trim() ? "Indiquez la ville ou le lieu." : null,
    description: !description.trim() ? "Décrivez en quelques mots ce que vous proposez." : null,
    date: parseEventDate(dateValue) ? null : "Indiquez une date au format JJ/MM/AAAA.",
  };
  const show = (k: Key) => (touched[k] ? problems[k] : null);
  const leave = (k: Key) => () => setTouched((t) => ({ ...t, [k]: true }));

  async function submit() {
    setTouched({ title: true, location: true, description: true, date: true });
    if (Object.values(problems).some(Boolean)) {
      haptic.error();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const event = await api.createEvent({ title: title.trim(), description: description.trim(), date: dateValue, location: location.trim() });
      haptic.success();
      router.replace(`/events/${event.id}`);
    } catch (e) {
      haptic.error();
      setError(e instanceof Error ? e.message : "Publication impossible. Réessayez.");
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen} keyboardVerticalOffset={60}>
      <Stack.Screen options={{ headerLeft: () => <HeaderButton title="Annuler" onPress={() => router.back()} /> }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Field
            label="Titre"
            value={title}
            onChangeText={setTitle}
            onBlur={leave("title")}
            error={show("title")}
            placeholder="Ex. : Balade au bord du lac"
            returnKeyType="next"
            onSubmitEditing={() => locationRef.current?.focus()}
            submitBehavior="submit"
          />

          {native ? (
            <View style={{ gap: space.sm }}>
              <T variant="subhead" style={{ fontWeight: "600" }}>
                Date
              </T>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, minHeight: touch.button, backgroundColor: colors.fill, borderRadius: radius.md, paddingHorizontal: space.lg }}>
                <Icon name="calendar" size={20} color={colors.primaryText} />
                <T variant="callout" style={{ flex: 1 }}>
                  {formatEventDate(toEventDateString(date))}
                </T>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "compact" : "default"}
                  minimumDate={new Date()}
                  locale="fr-FR"
                  accentColor={colors.primary}
                  themeVariant="light"
                  onChange={(_, d) => {
                    if (d) {
                      haptic.selection();
                      setDate(d);
                    }
                  }}
                />
              </View>
            </View>
          ) : (
            <Field
              label="Date (JJ/MM/AAAA)"
              value={dateText}
              onChangeText={setDateText}
              onBlur={leave("date")}
              error={show("date")}
              placeholder="15/11/2026"
            />
          )}

          <Field
            ref={locationRef}
            label="Lieu"
            value={location}
            onChangeText={setLocation}
            onBlur={leave("location")}
            error={show("location")}
            placeholder="Ville"
            textContentType="addressCity"
            returnKeyType="next"
            onSubmitEditing={() => descriptionRef.current?.focus()}
            submitBehavior="submit"
          />
          <Field
            ref={descriptionRef}
            label="Description"
            value={description}
            onChangeText={setDescription}
            onBlur={leave("description")}
            error={show("description")}
            multiline
            placeholder="Racontez ce que vous proposez…"
          />
        </View>

        <View style={styles.section}>
          {!!error && <InlineMessage text={error} />}
          <Button title="Publier l'événement" onPress={submit} loading={saving} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
