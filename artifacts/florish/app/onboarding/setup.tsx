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

const CALORIE_GOALS: Record<string, number> = {
  lose_weight: 1500,
  tone_up: 1800,
  build_strength: 2200,
  general_fitness: 1800,
};

export default function SetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const canContinue = parseInt(age) > 0 && parseFloat(weight) > 0 && parseFloat(height) > 0;

  const handleContinue = async () => {
    if (!canContinue || !user) return;
    const calorieGoal = CALORIE_GOALS[user.fitnessGoal] ?? 1800;
    await updateUser({
      ...user,
      age: parseInt(age),
      weightKg: parseFloat(weight),
      heightCm: parseFloat(height),
      dailyCalorieGoal: calorieGoal,
    });
    router.push("/onboarding/water");
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

        <View style={styles.progress}>
          {[1, 2, 3, 4].map((step) => (
            <View
              key={step}
              style={[styles.progressDot, { backgroundColor: step <= 2 ? colors.primary : colors.border }]}
            />
          ))}
        </View>

        <View style={styles.header}>
          <Text style={[styles.step, { color: colors.mutedForeground }]}>Step 2 of 4</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>About you</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            This helps us personalise your calorie goal
          </Text>
        </View>

        <View style={styles.form}>
          {[
            { label: "Age", value: age, setter: setAge, unit: "years", keyboard: "numeric" as const, placeholder: "25" },
            { label: "Weight", value: weight, setter: setWeight, unit: "kg", keyboard: "decimal-pad" as const, placeholder: "65" },
            { label: "Height", value: height, setter: setHeight, unit: "cm", keyboard: "numeric" as const, placeholder: "168" },
          ].map(({ label, value, setter, unit, keyboard, placeholder }) => (
            <View key={label} style={styles.field}>
              <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                  placeholder={placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  value={value}
                  onChangeText={setter}
                  keyboardType={keyboard}
                />
                <View style={[styles.unitBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Text style={[styles.unitText, { color: colors.mutedForeground }]}>{unit}</Text>
                </View>
              </View>
            </View>
          ))}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, gap: 24 },
  back: { width: 40, height: 40, justifyContent: "center" },
  progress: { flexDirection: "row", gap: 6 },
  progressDot: { flex: 1, height: 4, borderRadius: 2 },
  header: { gap: 8 },
  step: { fontSize: 13, fontWeight: "600" as const, letterSpacing: 0.5, textTransform: "uppercase" as const },
  title: { fontSize: 32, fontWeight: "800" as const, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  form: { gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" as const },
  inputRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 18,
    fontWeight: "600" as const,
  },
  unitBadge: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  unitText: { fontSize: 15, fontWeight: "600" as const },
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
