import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, KeyboardAvoidingView, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ApiError } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { Field } from "@/components/Field";
import { Button, InlineMessage, styles, T } from "@/components/ui";
import { haptic } from "@/haptics";
import { colors, space } from "@/theme";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailError = submitted && !email.trim() ? "Indiquez votre adresse email." : null;
  const passwordError = submitted && !password ? "Indiquez votre mot de passe." : null;

  async function submit() {
    setSubmitted(true);
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (e) {
      haptic.error();
      // Network problem: show the real reason. Otherwise it's a wrong email/password.
      setError(e instanceof ApiError && e.status === 0 ? e.message : "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.content, { flexGrow: 1, justifyContent: "center" }]} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: "center", gap: space.sm }}>
            <Image source={require("../../../assets/heart.png")} style={{ width: 96, height: 96 }} accessibilityIgnoresInvertColors />
            <T variant="largeTitle">Senior Love</T>
            <T color={colors.secondaryText} style={{ textAlign: "center" }}>
              Rencontres et sorties pour les seniors
            </T>
          </View>

          <View style={styles.section}>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              placeholder="vous@exemple.com"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              submitBehavior="submit"
            />
            <Field
              ref={passwordRef}
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              secureTextEntry
              textContentType="password"
              autoComplete="current-password"
              returnKeyType="go"
              onSubmitEditing={submit}
            />
          </View>

          <View style={styles.section}>
            {!!error && <InlineMessage text={error} />}
            <Button title="Se connecter" onPress={submit} loading={loading} />
            <Button title="Créer un compte" variant="plain" onPress={() => router.push("/register")} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
