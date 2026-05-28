import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function SignInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const result =
        mode === "signup"
          ? await register(email.trim(), password, firstName.trim() || undefined)
          : await login(email.trim(), password);

      if (result.error) {
        setError(result.error);
      }
      // On success, AuthContext updates → index.tsx routes to correct screen automatically
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.card,
      borderColor: colors.border,
      color: colors.foreground,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 40, paddingBottom: botPad + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primary + "18" }]}>
            <Feather name="activity" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {mode === "signin" ? "Welcome back" : "Create account"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {mode === "signin"
              ? "Sign in to continue your Florish journey"
              : "Start your fitness journey today"}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {mode === "signup" && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>First Name</Text>
              <TextInput
                style={inputStyle}
                placeholder="Your first name"
                placeholderTextColor={colors.mutedForeground}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
            <TextInput
              style={inputStyle}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[inputStyle, styles.passwordInput]}
                placeholder={mode === "signup" ? "Min 8 characters" : "Your password"}
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                style={[styles.eyeBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
                onPress={() => setShowPassword((v) => !v)}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>
          </View>

          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: "#fee2e2", borderColor: "#fca5a5" }]}>
              <Feather name="alert-circle" size={14} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {mode === "signin" ? "Sign In" : "Create Account"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle mode */}
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => {
              setMode((m) => (m === "signin" ? "signup" : "signin"));
              setError("");
            }}
          >
            <Text style={[styles.toggleText, { color: colors.mutedForeground }]}>
              {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
              <Text style={{ color: colors.primary, fontWeight: "700" }}>
                {mode === "signin" ? "Sign Up" : "Sign In"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    gap: 32,
  },
  header: {
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordWrap: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
  },
  eyeBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700" as const,
  },
  toggleBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 14,
    textAlign: "center",
  },
});
