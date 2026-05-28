import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useFitness } from "@/context/FitnessContext";
import type { WeightEntry } from "@/lib/storage";

function WeightChart({ entries, colors }: { entries: WeightEntry[]; colors: any }) {
  if (entries.length < 2) {
    return (
      <View style={[chartStyles.empty, { backgroundColor: colors.muted, borderRadius: 12 }]}>
        <Text style={[chartStyles.emptyText, { color: colors.mutedForeground }]}>
          Log at least 2 weight entries to see chart
        </Text>
      </View>
    );
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const values = sorted.map((e) => e.weightKg);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const range = max - min;
  const w = 280;
  const h = 100;

  const points = sorted.map((e, i) => ({
    x: (i / (sorted.length - 1)) * w,
    y: h - ((e.weightKg - min) / range) * h,
    weight: e.weightKg,
    date: e.date,
  }));

  return (
    <View style={chartStyles.wrap}>
      <View style={{ width: w, height: h, position: "relative" as const }}>
        {points.map((p, i) => (
          <View key={i} style={[chartStyles.dot, { left: p.x - 5, top: p.y - 5, backgroundColor: colors.primary }]} />
        ))}
      </View>
      <View style={chartStyles.labels}>
        <Text style={[chartStyles.label, { color: colors.mutedForeground }]}>{sorted[0]?.date}</Text>
        <Text style={[chartStyles.label, { color: colors.mutedForeground }]}>{sorted[sorted.length - 1]?.date}</Text>
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  wrap: { gap: 8 },
  empty: { padding: 20, alignItems: "center" },
  emptyText: { fontSize: 13, textAlign: "center" },
  dot: { position: "absolute" as const, width: 10, height: 10, borderRadius: 5 },
  labels: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 11 },
});

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { weightLog, progressPhotos, logWeight, addPhoto, workoutHistory, streak } = useFitness();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [weightModal, setWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const latestWeight = weightLog.length > 0
    ? weightLog.sort((a, b) => b.date.localeCompare(a.date))[0]?.weightKg
    : user?.weightKg ?? 0;

  const bmi = user?.heightCm
    ? latestWeight! / Math.pow(user.heightCm / 100, 2)
    : null;

  const bmiCategory = bmi
    ? bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese"
    : null;

  const bmiColor = bmiCategory === "Normal" ? colors.success : bmiCategory === "Underweight" ? "#5DADE2" : colors.destructive;

  const totalWorkouts = workoutHistory.length;

  const handleLogWeight = async () => {
    const w = parseFloat(newWeight);
    if (!w || w <= 0) return;
    await logWeight(w);
    setNewWeight("");
    setWeightModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      const libStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libStatus.status !== "granted") return;
      const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        await addPhoto(result.assets[0].uri);
      }
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      await addPhoto(result.assets[0].uri);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: botPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Progress</Text>

        <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Workouts", value: totalWorkouts, icon: "activity", color: colors.primary },
            { label: "Streak", value: `${streak}d`, icon: "zap", color: colors.accent },
            { label: "This Week", value: workoutHistory.filter((h) => {
              const d = new Date(h.completedAt);
              const now = new Date();
              return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            }).length, icon: "calendar", color: colors.success },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Feather name={s.icon as any} size={20} color={s.color} />
              <Text style={[styles.statNum, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Weight</Text>
            <TouchableOpacity
              style={[styles.logBtn, { backgroundColor: colors.primary }]}
              onPress={() => setWeightModal(true)}
            >
              <Feather name="plus" size={14} color="#fff" />
              <Text style={styles.logBtnText}>Log</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weightCurrent}>
            <Text style={[styles.weightNum, { color: colors.foreground }]}>
              {latestWeight?.toFixed(1) ?? "—"}
            </Text>
            <Text style={[styles.weightUnit, { color: colors.mutedForeground }]}>kg</Text>
          </View>

          <WeightChart entries={weightLog} colors={colors} />
        </View>

        {bmi && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>BMI</Text>
            <View style={styles.bmiRow}>
              <Text style={[styles.bmiNum, { color: bmiColor }]}>{bmi.toFixed(1)}</Text>
              <View style={[styles.bmiCategory, { backgroundColor: bmiColor + "20" }]}>
                <Text style={[styles.bmiCategoryText, { color: bmiColor }]}>{bmiCategory}</Text>
              </View>
            </View>
            <View style={[styles.bmiBar, { backgroundColor: colors.muted }]}>
              <View style={[styles.bmiMarker, { left: `${Math.min(Math.max((bmi - 15) / 20 * 100, 0), 100)}%` as any, backgroundColor: bmiColor }]} />
            </View>
            <View style={styles.bmiLabels}>
              <Text style={[styles.bmiLabelText, { color: colors.mutedForeground }]}>15</Text>
              <Text style={[styles.bmiLabelText, { color: colors.mutedForeground }]}>18.5</Text>
              <Text style={[styles.bmiLabelText, { color: colors.mutedForeground }]}>25</Text>
              <Text style={[styles.bmiLabelText, { color: colors.mutedForeground }]}>30</Text>
              <Text style={[styles.bmiLabelText, { color: colors.mutedForeground }]}>35</Text>
            </View>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Progress Photos</Text>
            <TouchableOpacity
              style={[styles.logBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddPhoto}
            >
              <Feather name="camera" size={14} color="#fff" />
              <Text style={styles.logBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {progressPhotos.length === 0 ? (
            <TouchableOpacity
              style={[styles.photoEmpty, { borderColor: colors.border, backgroundColor: colors.muted }]}
              onPress={handleAddPhoto}
            >
              <Feather name="camera" size={32} color={colors.mutedForeground} />
              <Text style={[styles.photoEmptyText, { color: colors.mutedForeground }]}>
                Take your first progress photo
              </Text>
              <Text style={[styles.photoEmptyNote, { color: colors.mutedForeground }]}>
                Private — only visible to you
              </Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {[...progressPhotos].reverse().map((photo) => (
                <TouchableOpacity key={photo.id} onPress={() => setSelectedPhoto(photo.uri)}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoThumb}
                    contentFit="cover"
                  />
                  <Text style={[styles.photoDate, { color: colors.mutedForeground }]}>{photo.date}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      <Modal visible={weightModal} transparent animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
        <View style={[styles.modalBg, { backgroundColor: colors.background }]}>
          <View style={[styles.modalInner, { paddingBottom: insets.bottom + 24 }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Log Weight</Text>
            <View style={styles.weightInputRow}>
              <TextInput
                style={[styles.weightInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                placeholder="0.0"
                placeholderTextColor={colors.mutedForeground}
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="decimal-pad"
                autoFocus
              />
              <Text style={[styles.weightUnit2, { color: colors.foreground }]}>kg</Text>
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.muted }]}
                onPress={() => setWeightModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleLogWeight}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={!!selectedPhoto} transparent animationType="fade">
        <TouchableOpacity style={styles.photoModal} onPress={() => setSelectedPhoto(null)}>
          {selectedPhoto && (
            <Image source={{ uri: selectedPhoto }} style={styles.photoFull} contentFit="contain" />
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 16 },
  title: { fontSize: 30, fontWeight: "800" as const, letterSpacing: -0.5 },
  statsRow: {
    flexDirection: "row",
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  statItem: { flex: 1, alignItems: "center", gap: 6 },
  statNum: { fontSize: 24, fontWeight: "800" as const },
  statLabel: { fontSize: 12 },
  section: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 14 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "800" as const },
  logBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, gap: 4 },
  logBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" as const },
  weightCurrent: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  weightNum: { fontSize: 52, fontWeight: "800" as const, letterSpacing: -2 },
  weightUnit: { fontSize: 20, marginBottom: 8 },
  bmiRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  bmiNum: { fontSize: 40, fontWeight: "800" as const },
  bmiCategory: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  bmiCategoryText: { fontSize: 14, fontWeight: "700" as const },
  bmiBar: { height: 8, borderRadius: 4, position: "relative" as const, overflow: "visible" as const },
  bmiMarker: { position: "absolute" as const, width: 12, height: 16, borderRadius: 3, top: -4 },
  bmiLabels: { flexDirection: "row", justifyContent: "space-between" },
  bmiLabelText: { fontSize: 10 },
  photoEmpty: {
    borderWidth: 2,
    borderStyle: "dashed" as const,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  photoEmptyText: { fontSize: 15, fontWeight: "600" as const },
  photoEmptyNote: { fontSize: 12 },
  photoThumb: { width: 120, height: 150, borderRadius: 12 },
  photoDate: { fontSize: 11, textAlign: "center", marginTop: 4 },
  modalBg: { flex: 1, justifyContent: "flex-end" },
  modalInner: { padding: 24, gap: 20 },
  modalTitle: { fontSize: 20, fontWeight: "800" as const },
  weightInputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  weightInput: { flex: 1, paddingHorizontal: 20, paddingVertical: 16, borderRadius: 14, borderWidth: 1, fontSize: 28, fontWeight: "800" as const, textAlign: "center" as const },
  weightUnit2: { fontSize: 20, fontWeight: "700" as const },
  modalBtns: { flexDirection: "row", gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  modalBtnText: { fontSize: 16, fontWeight: "700" as const },
  photoModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
  photoFull: { width: "90%", height: "80%", borderRadius: 12 } as any,
});
