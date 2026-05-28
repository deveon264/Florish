import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { height, width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image
        source={require("@/assets/images/hero.jpg")}
        style={styles.heroImage}
        contentFit="cover"
        priority="high"
        placeholder={{ color: "#EDD5C8" }}
        transition={200}
      />
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]} />

      <View style={[styles.content, { paddingTop: topPad + 20, paddingBottom: botPad + 24 }]}>
        <View style={styles.top}>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.primaryForeground }]}>
              By Dillish
            </Text>
          </View>
          <Text style={styles.appName}>Florish</Text>
          <Text style={styles.tagline}>Your premium fitness journey{"\n"}starts here</Text>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/onboarding/signup")}
            activeOpacity={0.85}
          >
            <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
              Begin Your Journey
            </Text>
          </TouchableOpacity>

          <View style={styles.features}>
            {["Personalised workouts", "AI calorie tracking", "Progress insights"].map((f) => (
              <View key={f} style={styles.featureRow}>
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.featureText, { color: "rgba(255,255,255,0.85)" }]}>{f}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push("/onboarding/signin")}
            activeOpacity={0.75}
          >
            <Text style={styles.signInText}>
              Already have an account?{" "}
              <Text style={[styles.signInLink, { color: colors.primary }]}>Sign In</Text>
            </Text>
          </TouchableOpacity>

          <Text style={[styles.disclaimer, { color: "rgba(255,255,255,0.5)" }]}>
            By continuing you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  top: { gap: 12 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
  },
  appName: {
    fontSize: 64,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    letterSpacing: -2,
    lineHeight: 68,
  },
  tagline: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 26,
    fontWeight: "400" as const,
  },
  bottom: { gap: 20 },
  primaryBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: "700" as const,
    letterSpacing: 0.2,
  },
  features: { gap: 10 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  featureText: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  signInBtn: {
    alignItems: "center",
    paddingVertical: 4,
  },
  signInText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  signInLink: {
    fontWeight: "700" as const,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: "center",
  },
});
