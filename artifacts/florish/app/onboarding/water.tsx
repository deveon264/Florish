import { router } from "expo-router";
import React, { useState } from "react";
import {
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

const WATER_OPTIONS = [
  { ml: 1500, label: "1.5 L", desc: "Light activity" },
  { ml: 2000, label: "2 L", desc: "Recommended" },
  { ml: 2500, label: "2.5 L", desc: "Active lifestyle" },
  { ml: 3000, label: "3 L", desc: "Intense training" },
];

export default function WaterGoalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser, completeOnboarding } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selectedMl, setSelectedMl] = useState(2000);

  const handleContinue = async () => {
    if (!user) return;
    await updateUser({ ...user, dailyWaterGoalMl: selectedMl });
    await completeOnboarding();
    router.replace("/paywall");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.inner, { paddingTop: topPad + 20, paddingBottom: botPad + 24 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.progress}>
          {[1, 2, 3, 4].map((step) => (
            <View
              key={step}
              style={[styles.progressDot, { backgroundColor: step <= 4 ? colors.primary : colors.border }]}
            />
          ))}
        </View>

        <View style={styles.header}>
          <Text style={[styles.step, { color: colors.mutedForeground }]}>Step 4 of 4</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Daily water goal</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Staying hydrated is key to your results
          </Text>
        </View>

        <View style={styles.waterVisual}>
          <View style={[styles.cupOuter, { borderColor: "#A8D4F0" }]}>
            <View
              style={[
                styles.cupFill,
                {
                  backgroundColor: "#A8D4F0",
                  height: `${(selectedMl / 3000) * 100}%` as any,
                },
              ]}
            />
            <Text style={[styles.cupLabel, { color: colors.foreground }]}>
              {(selectedMl / 1000).toFixed(1)} L
            </Text>
            <Text style={[styles.cupSub, { color: colors.mutedForeground }]}>
              {Math.round(selectedMl / 250)} glasses
            </Text>
          </View>
        </View>

        <View style={styles.options}>
          {WATER_OPTIONS.map((opt) => {
            const isSelected = selectedMl === opt.ml;
            return (
              <TouchableOpacity
                key={opt.ml}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isSelected ? "#A8D4F0" + "22" : colors.card,
                    borderColor: isSelected ? "#A8D4F0" : colors.border,
                  },
                ]}
                onPress={() => setSelectedMl(opt.ml)}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionLabel, { color: colors.foreground }]}>{opt.label}</Text>
                <Text style={[styles.optionDesc, { color: colors.mutedForeground }]}>{opt.desc}</Text>
                {isSelected && <Feather name="check-circle" size={20} color="#A8D4F0" />}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={[styles.continueBtnText, { color: colors.primaryForeground }]}>
            Start My Journey
          </Text>
          <Feather name="arrow-right" size={18} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, gap: 20 },
  back: { width: 40, height: 40, justifyContent: "center" },
  progress: { flexDirection: "row", gap: 6 },
  progressDot: { flex: 1, height: 4, borderRadius: 2 },
  header: { gap: 8 },
  step: { fontSize: 13, fontWeight: "600" as const, letterSpacing: 0.5, textTransform: "uppercase" as const },
  title: { fontSize: 32, fontWeight: "800" as const, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  waterVisual: { alignItems: "center" },
  cupOuter: {
    width: 100,
    height: 130,
    borderWidth: 2.5,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative" as const,
  },
  cupFill: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
  },
  cupLabel: { fontSize: 22, fontWeight: "800" as const, zIndex: 1 },
  cupSub: { fontSize: 12, zIndex: 1 },
  options: { gap: 10, flex: 1 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  optionLabel: { fontSize: 16, fontWeight: "700" as const, flex: 1 },
  optionDesc: { fontSize: 13 },
  continueBtn: {
    flexDirection: "row",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  continueBtnText: { fontSize: 17, fontWeight: "700" as const },
});
