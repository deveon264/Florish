import React, { useState } from "react";
import {
  Alert,
  Modal,
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
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useFitness } from "@/context/FitnessContext";

const GLASS_OPTIONS = [
  { label: "Small", ml: 150, icon: "droplet" },
  { label: "Glass", ml: 250, icon: "droplet" },
  { label: "Bottle", ml: 500, icon: "droplet" },
  { label: "Large", ml: 750, icon: "droplet" },
];

export default function WaterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { todayWater, todayWaterMl, logWater } = useFitness();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [customModal, setCustomModal] = useState(false);
  const [customMl, setCustomMl] = useState("");

  const goalMl = user?.dailyWaterGoalMl ?? 2000;
  const glasses = Math.round(todayWaterMl / 250);
  const goalGlasses = Math.round(goalMl / 250);
  const pct = Math.min(todayWaterMl / goalMl, 1);

  const handleAdd = async (ml: number) => {
    await logWater(ml);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleCustom = async () => {
    const ml = parseInt(customMl);
    if (!ml || ml <= 0) return;
    await handleAdd(ml);
    setCustomMl("");
    setCustomModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: botPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Water Tracker</Text>

        <View style={[styles.mainCard, { backgroundColor: "#EBF5FB", borderColor: "#A8D4F0" }]}>
          <Text style={[styles.cardTitle, { color: "#1A5276" }]}>Today's Intake</Text>
          <View style={styles.cupWrap}>
            <View style={[styles.cup, { borderColor: "#5DADE2" }]}>
              <View style={[styles.cupWater, { height: `${pct * 100}%` as any, backgroundColor: "#5DADE2" }]} />
              <View style={styles.cupContent}>
                <Text style={[styles.mlText, { color: "#1A5276" }]}>{todayWaterMl}</Text>
                <Text style={[styles.mlLabel, { color: "#2980B9" }]}>ml</Text>
              </View>
            </View>
          </View>

          <View style={styles.progressRow}>
            <View style={[styles.progressOuter, { backgroundColor: "rgba(93,173,226,0.2)" }]}>
              <View style={[styles.progressFill, { width: `${pct * 100}%` as any, backgroundColor: "#5DADE2" }]} />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: "#1A5276" }]}>{glasses}</Text>
              <Text style={[styles.statLabel, { color: "#2980B9" }]}>glasses</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: "#A8D4F0" }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: "#1A5276" }]}>{goalGlasses - glasses > 0 ? goalGlasses - glasses : 0}</Text>
              <Text style={[styles.statLabel, { color: "#2980B9" }]}>remaining</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: "#A8D4F0" }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: "#1A5276" }]}>{(goalMl / 1000).toFixed(1)}L</Text>
              <Text style={[styles.statLabel, { color: "#2980B9" }]}>goal</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Add Water</Text>
        <View style={styles.quickAdd}>
          {GLASS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.ml}
              style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleAdd(opt.ml)}
              activeOpacity={0.8}
            >
              <View style={[styles.dropIcon, { backgroundColor: "#EBF5FB" }]}>
                <Feather name="droplet" size={20} color="#5DADE2" />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>{opt.label}</Text>
              <Text style={[styles.quickMl, { color: colors.mutedForeground }]}>{opt.ml}ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.customBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
          onPress={() => setCustomModal(true)}
        >
          <Feather name="edit-3" size={16} color={colors.foreground} />
          <Text style={[styles.customBtnText, { color: colors.foreground }]}>Custom amount</Text>
        </TouchableOpacity>

        {todayWater.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Log</Text>
            {[...todayWater].reverse().map((entry) => (
              <View key={entry.id} style={[styles.logRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.logIcon, { backgroundColor: "#EBF5FB" }]}>
                  <Feather name="droplet" size={16} color="#5DADE2" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.logAmount, { color: colors.foreground }]}>{entry.amountMl}ml</Text>
                  <Text style={[styles.logTime, { color: colors.mutedForeground }]}>
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {todayWaterMl >= goalMl && (
          <View style={[styles.goalBanner, { backgroundColor: "#EBF5FB", borderColor: "#A8D4F0" }]}>
            <Feather name="award" size={24} color="#5DADE2" />
            <Text style={[styles.goalBannerText, { color: "#1A5276" }]}>
              Goal reached! You're crushing it today! 🎉
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={customModal} transparent animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.customModal, { backgroundColor: colors.background }]}>
          <View style={[styles.customModalInner, { paddingBottom: botPad + 24 }]}>
            <Text style={[styles.customModalTitle, { color: colors.foreground }]}>Custom Amount</Text>
            <View style={styles.customInputRow}>
              <TextInput
                style={[styles.customInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                value={customMl}
                onChangeText={setCustomMl}
                keyboardType="numeric"
                autoFocus
              />
              <Text style={[styles.customUnit, { color: colors.foreground }]}>ml</Text>
            </View>
            <View style={styles.customModalBtns}>
              <TouchableOpacity
                style={[styles.customModalBtn, { backgroundColor: colors.muted }]}
                onPress={() => setCustomModal(false)}
              >
                <Text style={[styles.customModalBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.customModalBtn, { backgroundColor: "#5DADE2" }]}
                onPress={handleCustom}
              >
                <Text style={[styles.customModalBtnText, { color: "#fff" }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 16 },
  title: { fontSize: 30, fontWeight: "800" as const, letterSpacing: -0.5 },
  mainCard: { borderRadius: 24, borderWidth: 1.5, padding: 20, gap: 16 },
  cardTitle: { fontSize: 16, fontWeight: "700" as const },
  cupWrap: { alignItems: "center" },
  cup: {
    width: 100,
    height: 140,
    borderRadius: 20,
    borderWidth: 3,
    overflow: "hidden",
    justifyContent: "flex-end",
    position: "relative" as const,
  },
  cupWater: { position: "absolute" as const, bottom: 0, left: 0, right: 0 },
  cupContent: {
    position: "absolute" as const,
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  mlText: { fontSize: 26, fontWeight: "800" as const },
  mlLabel: { fontSize: 14 },
  progressRow: {},
  progressOuter: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  statItem: { alignItems: "center", gap: 2 },
  statNum: { fontSize: 24, fontWeight: "800" as const },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, height: 32 },
  sectionTitle: { fontSize: 18, fontWeight: "800" as const },
  quickAdd: { flexDirection: "row", gap: 10 },
  quickBtn: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  dropIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  quickLabel: { fontSize: 13, fontWeight: "700" as const },
  quickMl: { fontSize: 11 },
  customBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  customBtnText: { fontSize: 15, fontWeight: "600" as const },
  logRow: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
  logIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  logAmount: { fontSize: 15, fontWeight: "700" as const },
  logTime: { fontSize: 12 },
  goalBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  goalBannerText: { fontSize: 14, fontWeight: "600" as const, flex: 1, lineHeight: 20 },
  customModal: { flex: 1, justifyContent: "flex-end" },
  customModalInner: { padding: 24, gap: 20 },
  customModalTitle: { fontSize: 20, fontWeight: "800" as const },
  customInputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  customInput: { flex: 1, paddingHorizontal: 20, paddingVertical: 16, borderRadius: 14, borderWidth: 1, fontSize: 28, fontWeight: "800" as const, textAlign: "center" as const },
  customUnit: { fontSize: 20, fontWeight: "700" as const },
  customModalBtns: { flexDirection: "row", gap: 12 },
  customModalBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  customModalBtnText: { fontSize: 16, fontWeight: "700" as const },
});
