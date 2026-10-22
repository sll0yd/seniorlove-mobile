import { useState } from "react";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { Button, Field, styles } from "@/components/ui";
import { colors } from "@/theme";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"F" | "M" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const ageNumber = Number.parseInt(age, 10);
    if (!userName || !email || !gender) return setError("Merci de remplir tous les champs.");
    if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");
    if (Number.isNaN(ageNumber) || ageNumber < 18) return setError("Merci d'indiquer un âge valide.");

    setLoading(true);
    setError(null);
    try {
      await signUp({ userName: userName.trim(), email, password, age: ageNumber, gender });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Inscription impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen} keyboardVerticalOffset={100}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="Prénom" value={userName} onChangeText={setUserName} autoComplete="given-name" />
        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <Field label="Mot de passe (8 caractères minimum)" value={password} onChangeText={setPassword} secureTextEntry textContentType="newPassword" />
        <Field label="Âge" value={age} onChangeText={setAge} keyboardType="number-pad" maxLength={3} />

        <View style={{ gap: 6 }}>
          <Text style={styles.label}>Je suis</Text>
          <View style={styles.row}>
            {(["F", "M"] as const).map((g) => (
              <Button
                key={g}
                title={g === "F" ? "Une femme" : "Un homme"}
                variant={gender === g ? "primary" : "outline"}
                onPress={() => setGender(g)}
                style={{ flex: 1 }}
              />
            ))}
          </View>
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button title="Créer mon compte" onPress={submit} loading={loading} />
        <Text style={[styles.small, { textAlign: "center", color: colors.muted }]}>En vous inscrivant, vous acceptez les conditions d'utilisation de Senior Love.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
