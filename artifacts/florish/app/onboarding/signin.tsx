import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
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
  const { login } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { paddingTop: topPad + 60, paddingBottom: botPad + 40 }]}>
        <View style={styles.top}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primary + "18" }]}>
            <Feather name="activity" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Sign in to continue your Florish journey
          </Text>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="log-in" size={18} color="#fff" />
                <Text style={styles.loginBtnText}>Continue</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={[styles.note, { color: colors.mutedForeground }]}>
            You'll be securely signed in to your account
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "space-between",
  },
  top: {
    alignItems: "center",
    gap: 16,
    paddingTop: 40,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  bottom: {
    gap: 16,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700" as const,
  },
  note: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
