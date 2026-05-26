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

type Goal = "lose_weight" | "tone_up" | "build_strength" | "general_fitness";

const GOALS: { id: Goal; label: string; desc: string; icon: string }[] = [
  { id: "lose_weight", label: "Lose Weight", desc: "Burn fat and feel lighter", icon: "trending-down" },
  { id: "tone_up", label: "Tone Up", desc: "Build lean muscle and definition", icon: "activity" },
  { id: "build_strength", label: "Build Strength", desc: "Increase power and endurance", icon: "zap" },
  { id: "general_fitness", label: "General Fitness", desc: "Stay active and feel great", icon: "heart" },
];

export default function GoalsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selected, setSelected] = useState<Goal | null>(null);

  const handleContinue = async () => {
    if (!selected || !user) return;
    await updateUser({ ...user, fitnessGoal: selected });
    router.push("/onboarding/setup");
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
              style={[
                styles.progressDot,
                { backgroundColor: step <= 1 ? colors.primary : colors.border },
              ]}
            />
          ))}
        </View>

        <View style={styles.header}>
          <Text style={[styles.step, { color: colors.mutedForeground }]}>Step 1 of 4</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            What's your{"\n"}main goal?
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            We'll personalise your experience based on this
          </Text>
        </View>

        <View style={styles.goals}>
          {GOALS.map((goal) => {
            const isSelected = selected === goal.id;
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  {
                    backgroundColor: isSelected ? colors.primary + "15" : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelected(goal.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconWrap, { backgroundColor: isSelected ? colors.primary : colors.muted }]}>
                  <Feather name={goal.icon as any} size={22} color={isSelected ? "#fff" : colors.mutedForeground} />
                </View>
                <View style={styles.goalText}>
                  <Text style={[styles.goalLabel, { color: colors.foreground }]}>{goal.label}</Text>
                  <Text style={[styles.goalDesc, { color: colors.mutedForeground }]}>{goal.desc}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.check, { backgroundColor: colors.primary }]}>
                    <Feather name="check" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: selected ? colors.primary : colors.muted }]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={!selected}
        >
          <Text style={[styles.continueBtnText, { color: selected ? colors.primaryForeground : colors.mutedForeground }]}>
            Continue
          </Text>
          <Feather name="arrow-right" size={18} color={selected ? colors.primaryForeground : colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, gap: 24 },
  back: { width: 40, height: 40, justifyContent: "center" },
  progress: { flexDirection: "row", gap: 6 },
  progressDot: { flex: 1, height: 4, borderRadius: 2 },
  header: { gap: 8 },
  step: { fontSize: 13, fontWeight: "600" as const, letterSpacing: 0.5, textTransform: "uppercase" as const },
  title: { fontSize: 32, fontWeight: "800" as const, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  goals: { gap: 12, flex: 1 },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
  },
  iconWrap: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  goalText: { flex: 1, gap: 2 },
  goalLabel: { fontSize: 16, fontWeight: "700" as const },
  goalDesc: { fontSize: 13, lineHeight: 18 },
  check: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
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
