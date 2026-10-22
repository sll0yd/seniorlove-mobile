import { useRef, useState } from "react";
import { KeyboardAvoidingView, ScrollView, TextInput, View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { Field } from "@/components/Field";
import { Button, InlineMessage, PressableScale, styles, T } from "@/components/ui";
import { haptic } from "@/haptics";
import { colors, radius, space, touch } from "@/theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Key = "userName" | "email" | "password" | "age" | "gender";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const ageRef = useRef<TextInput>(null);

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"F" | "M" | null>(null);
  // A field shows its error once the person has left it, or tried to submit.
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ageNumber = Number.parseInt(age, 10);
  const problems: Record<Key, string | null> = {
    userName: !userName.trim() ? "Indiquez votre prénom." : null,
    email: !EMAIL_RE.test(email.trim()) ? "Indiquez une adresse email valide." : null,
    password: password.length < 8 ? `Au moins 8 caractères (encore ${Math.max(0, 8 - password.length)}).` : null,
    age: Number.isNaN(ageNumber) || ageNumber < 18 || ageNumber > 120 ? "Indiquez un âge valide." : null,
    gender: !gender ? "Choisissez une option." : null,
  };
  const show = (k: Key) => (touched[k] ? problems[k] : null);
  const leave = (k: Key) => () => setTouched((t) => ({ ...t, [k]: true }));

  async function submit() {
    setTouched({ userName: true, email: true, password: true, age: true, gender: true });
    if (Object.values(problems).some(Boolean)) {
      haptic.error();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUp({ userName: userName.trim(), email, password, age: ageNumber, gender: gender! });
      haptic.success();
    } catch (e) {
      haptic.error();
      setError(e instanceof Error ? e.message : "Inscription impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen} keyboardVerticalOffset={100}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic">
        <View style={styles.section}>
          <Field
            label="Prénom"
            value={userName}
            onChangeText={setUserName}
            onBlur={leave("userName")}
            error={show("userName")}
            autoComplete="given-name"
            textContentType="givenName"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            submitBehavior="submit"
          />
          <Field
            ref={emailRef}
            label="Email"
            value={email}
            onChangeText={setEmail}
            onBlur={leave("email")}
            error={show("email")}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            submitBehavior="submit"
          />
          <Field
            ref={passwordRef}
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            onBlur={leave("password")}
            error={show("password")}
            hint="8 caractères minimum."
            secureTextEntry
            textContentType="newPassword"
            autoComplete="new-password"
            returnKeyType="next"
            onSubmitEditing={() => ageRef.current?.focus()}
            submitBehavior="submit"
          />
          <Field
            ref={ageRef}
            label="Âge"
            value={age}
            onChangeText={(v) => setAge(v.replace(/\D/g, ""))}
            onBlur={leave("age")}
            error={show("age")}
            keyboardType="number-pad"
            maxLength={3}
          />
        </View>

        <View style={{ gap: space.sm }}>
          <T variant="subhead" style={{ fontWeight: "600" }}>
            Je suis
          </T>
          <Segmented
            options={[
              { value: "F", label: "Une femme" },
              { value: "M", label: "Un homme" },
            ]}
            value={gender}
            onChange={(g) => {
              setGender(g);
              setTouched((t) => ({ ...t, gender: true }));
            }}
          />
          {!!show("gender") && <InlineMessage text={show("gender")!} />}
        </View>

        <View style={styles.section}>
          {!!error && <InlineMessage text={error} />}
          <Button title="Créer mon compte" onPress={submit} loading={loading} />
          <T variant="footnote" color={colors.secondaryText} style={{ textAlign: "center" }}>
            En vous inscrivant, vous acceptez les conditions d'utilisation de Senior Love.
          </T>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// iOS-style segmented choice, sized for easy tapping.
function Segmented<V extends string>({ options, value, onChange }: { options: { value: V; label: string }[]; value: V | null; onChange: (v: V) => void }) {
  return (
    <View style={{ flexDirection: "row", backgroundColor: colors.fill, borderRadius: radius.md, padding: space.xs, gap: space.xs }} accessibilityRole="radiogroup">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <PressableScale
            key={o.value}
            onPress={() => {
              haptic.selection();
              onChange(o.value);
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            containerStyle={{ flex: 1 }}
            style={{
              flex: 1,
              minHeight: touch.min + 4,
              borderRadius: radius.sm,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: active ? colors.surface : "transparent",
              shadowColor: "#000",
              shadowOpacity: active ? 0.08 : 0,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
            }}
          >
            <T variant="callout" style={{ fontWeight: active ? "600" : "400" }} color={active ? colors.primaryText : colors.text}>
              {o.label}
            </T>
          </PressableScale>
        );
      })}
    </View>
  );
}
