import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

export default function SignInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canContinue = email.includes("@");

  const handleSignIn = async () => {
    if (!canContinue) return;
    setError("");
    setLoading(true);
    try {
      const result = await signIn(email, rememberMe);
      if (result.success) {
        router.replace("/");
      } else {
        setError(result.error ?? "Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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
          <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Sign in to continue your Florish journey
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: error ? colors.destructive : colors.border }]}
              placeholder="hello@example.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(""); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
            />
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: "#FFF0F0", borderColor: "#FFCDD2" }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe((v) => !v)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              {
                borderColor: rememberMe ? colors.primary : colors.border,
                backgroundColor: rememberMe ? colors.primary : "transparent",
              },
            ]}>
              {rememberMe && <Feather name="check" size={11} color={colors.primaryForeground} />}
            </View>
            <Text style={[styles.rememberLabel, { color: colors.mutedForeground }]}>
              Remember me
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: canContinue && !loading ? colors.primary : colors.muted }]}
          onPress={handleSignIn}
          activeOpacity={0.85}
          disabled={!canContinue || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <>
              <Text style={[styles.continueBtnText, { color: canContinue ? colors.primaryForeground : colors.mutedForeground }]}>
                Sign In
              </Text>
              <Feather name="arrow-right" size={18} color={canContinue ? colors.primaryForeground : colors.mutedForeground} />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or</Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity onPress={() => router.replace("/onboarding/signup")}>
          <Text style={[styles.signupText, { color: colors.mutedForeground }]}>
            Don't have an account?{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>Create one</Text>
          </Text>
        </TouchableOpacity>
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
  form: { gap: 14 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" as const },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, flex: 1, lineHeight: 18 },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  rememberLabel: { fontSize: 14 },
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
  signupText: { textAlign: "center", fontSize: 14 },
});
