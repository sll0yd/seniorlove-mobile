import { router } from "expo-router";
import { useState } from "react";
import { Image, KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/auth/AuthContext";
import { Button, Field, styles } from "@/components/ui";
import { colors } from "@/theme";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email || !password) return setError("Merci de renseigner votre email et votre mot de passe.");
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.content, { flexGrow: 1, justifyContent: "center" }]} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Image source={require("../../../assets/heart.png")} style={{ width: 96, height: 96 }} />
            <Text style={[styles.title, { fontSize: 34 }]}>Senior Love</Text>
            <Text style={[styles.body, { color: colors.muted, textAlign: "center" }]}>Rencontres et sorties pour les seniors</Text>
          </View>

          <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" placeholder="vous@exemple.com" />
          <Field label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry textContentType="password" onSubmitEditing={submit} />
          {!!error && <Text style={styles.error}>{error}</Text>}

          <Button title="Se connecter" onPress={submit} loading={loading} />
          <Button title="Créer un compte" variant="outline" onPress={() => router.push("/register")} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
