import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useFitness } from "@/context/FitnessContext";
import { useSubscription } from "@/lib/revenuecat";

const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Lose Weight",
  tone_up: "Tone Up",
  build_strength: "Build Strength",
  general_fitness: "General Fitness",
};

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { workoutHistory, streak } = useFitness();
  const { isSubscribed, customerInfo } = useSubscription();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [logoutModal, setLogoutModal] = useState(false);

  const handleLogout = async () => {
    setLogoutModal(false);
    await logout();
    router.replace("/onboarding/welcome");
  };

  const expiresDate = customerInfo?.entitlements.active?.premium?.expirationDate;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: botPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{(user?.name?.[0] ?? "F").toUpperCase()}</Text>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>{user?.name ?? "Florish User"}</Text>
          <Text style={[styles.email, { color: colors.mutedForeground }]}>{user?.email ?? ""}</Text>
          {isSubscribed && (
            <View style={[styles.premiumBadge, { backgroundColor: colors.primary }]}>
              <Feather name="star" size={12} color="#fff" />
              <Text style={styles.premiumText}>Premium Member</Text>
            </View>
          )}
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: "activity", label: "Total Workouts", value: workoutHistory.length },
            { icon: "zap", label: "Current Streak", value: `${streak} days` },
            { icon: "target", label: "Goal", value: GOAL_LABELS[user?.fitnessGoal ?? ""] ?? "—" },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.primary + "20" }]}>
                <Feather name={s.icon as any} size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Body Stats</Text>
          {[
            { label: "Age", value: user?.age ? `${user.age} years` : "—" },
            { label: "Weight", value: user?.weightKg ? `${user.weightKg} kg` : "—" },
            { label: "Height", value: user?.heightCm ? `${user.heightCm} cm` : "—" },
            { label: "Daily Calorie Goal", value: user?.dailyCalorieGoal ? `${user.dailyCalorieGoal} kcal` : "—" },
            { label: "Daily Water Goal", value: user?.dailyWaterGoalMl ? `${(user.dailyWaterGoalMl / 1000).toFixed(1)} L` : "—" },
          ].map((item, i) => (
            <View key={item.label} style={[styles.infoRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Subscription</Text>
          <View style={styles.subStatus}>
            <View style={[styles.subDot, { backgroundColor: isSubscribed ? colors.success : colors.mutedForeground }]} />
            <Text style={[styles.subStatusText, { color: isSubscribed ? colors.success : colors.mutedForeground }]}>
              {isSubscribed ? "Active — Florish Premium" : "No active subscription"}
            </Text>
          </View>
          {expiresDate && (
            <Text style={[styles.subExpiry, { color: colors.mutedForeground }]}>
              Renews: {new Date(expiresDate).toLocaleDateString()}
            </Text>
          )}
          {!isSubscribed && (
            <TouchableOpacity
              style={[styles.upgradeBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/paywall")}
            >
              <Feather name="star" size={16} color="#fff" />
              <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Settings</Text>
          {[
            { icon: "bell", label: "Notifications", action: () => {} },
            { icon: "lock", label: "Privacy", action: () => {} },
            { icon: "help-circle", label: "Help & Support", action: () => {} },
            { icon: "info", label: "About Florish", action: () => {} },
          ].map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.settingRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}>
                <Feather name={item.icon as any} size={16} color={colors.foreground} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.dillishCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
          <Text style={[styles.dillishTitle, { color: colors.primaryDark }]}>About Dillish</Text>
          <Text style={[styles.dillishText, { color: colors.foreground }]}>
            Florish was created with Dillish to help women worldwide achieve their fitness goals through personalised guidance, expert workouts, and smart nutrition tracking.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.destructive }]}
          onPress={() => setLogoutModal(true)}
        >
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={logoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Log Out?</Text>
            <Text style={[styles.modalBody, { color: colors.mutedForeground }]}>
              Your data is saved locally and will be there when you come back.
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.muted }]}
                onPress={() => setLogoutModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.destructive }]}
                onPress={handleLogout}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>Log Out</Text>
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
  avatarSection: { alignItems: "center", gap: 8, paddingVertical: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "800" as const },
  name: { fontSize: 24, fontWeight: "800" as const },
  email: { fontSize: 14 },
  premiumBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, gap: 4 },
  premiumText: { color: "#fff", fontSize: 12, fontWeight: "700" as const },
  statsCard: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 16 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 14 },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "700" as const },
  statLabel: { fontSize: 12, marginTop: 2 },
  infoCard: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 0 },
  cardTitle: { fontSize: 17, fontWeight: "800" as const, marginBottom: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: "600" as const },
  subStatus: { flexDirection: "row", alignItems: "center", gap: 8 },
  subDot: { width: 8, height: 8, borderRadius: 4 },
  subStatusText: { fontSize: 15, fontWeight: "600" as const },
  subExpiry: { fontSize: 13 },
  upgradeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 14, gap: 8, marginTop: 8 },
  upgradeBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" as const },
  settingRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 14 },
  settingIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  settingLabel: { flex: 1, fontSize: 15 },
  dillishCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  dillishTitle: { fontSize: 15, fontWeight: "800" as const },
  dillishText: { fontSize: 14, lineHeight: 20 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, gap: 8 },
  logoutText: { fontSize: 16, fontWeight: "700" as const },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalCard: { borderRadius: 20, padding: 24, gap: 14, width: "100%", maxWidth: 320 },
  modalTitle: { fontSize: 18, fontWeight: "700" as const },
  modalBody: { fontSize: 14, lineHeight: 20 },
  modalBtns: { flexDirection: "row", gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  modalBtnText: { fontSize: 15, fontWeight: "600" as const },
});
