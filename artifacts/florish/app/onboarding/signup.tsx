import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import type { UserProfile } from "@/lib/storage";

export default function SignupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { updateUser } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const canContinue = name.trim().length > 0 && email.includes("@") && password.length >= 6;

  const handleContinue = async () => {
    if (!canContinue) {
      setError("Please fill in all fields correctly.");
      return;
    }
    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      fitnessGoal: "general_fitness",
      age: 0,
      weightKg: 0,
      heightCm: 0,
      dailyWaterGoalMl: 2000,
      dailyCalorieGoal: 1800,
      createdAt: new Date().toISOString(),
    };
    await updateUser(profile);
    router.push("/onboarding/goals");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 20, paddingBottom: botPad + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Create your account</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Join thousands of women transforming with Florish
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder="hello@example.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Minimum 6 characters"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoComplete="password-new"
              />
              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                style={[styles.eyeBtn, { right: 16 }]}
              >
                <Feather name={showPass ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: canContinue ? colors.primary : colors.muted }]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={!canContinue}
        >
          <Text style={[styles.continueBtnText, { color: canContinue ? colors.primaryForeground : colors.mutedForeground }]}>
            Continue
          </Text>
          <Feather name="arrow-right" size={18} color={canContinue ? colors.primaryForeground : colors.mutedForeground} />
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or</Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <Text style={[styles.loginText, { color: colors.mutedForeground }]}>
          Already have an account?{" "}
          <Text style={{ color: colors.primary, fontWeight: "600" as const }}>Sign In</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, gap: 28 },
  back: { width: 40, height: 40, justifyContent: "center" },
  header: { gap: 8 },
  title: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, lineHeight: 22 },
  form: { gap: 18 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" as const },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  passwordRow: { position: "relative" as const },
  passwordInput: { paddingRight: 48 },
  eyeBtn: {
    position: "absolute" as const,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  errorText: { fontSize: 13 },
  continueBtn: {
    flexDirection: "row",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  continueBtnText: { fontSize: 17, fontWeight: "700" as const },
  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  line: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },
  loginText: { textAlign: "center", fontSize: 14 },
});
