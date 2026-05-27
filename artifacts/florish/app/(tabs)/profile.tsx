import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
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
  const [activeModal, setActiveModal] = useState<"privacy" | "help" | "about" | null>(null);

  const handleLogout = async () => {
    setLogoutModal(false);
    await logout();
    router.replace("/onboarding/welcome");
  };

  const handleNotifications = () => {
    if (Platform.OS === "web") {
      Alert.alert("Notifications", "Enable notifications in your browser settings to receive workout reminders and motivational messages from Dillish.");
      return;
    }
    Alert.alert(
      "Notifications",
      "Manage your workout reminders and motivational messages from Dillish.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]
    );
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
            { icon: "bell", label: "Notifications", action: handleNotifications },
            { icon: "lock", label: "Privacy", action: () => setActiveModal("privacy") },
            { icon: "help-circle", label: "Help & Support", action: () => setActiveModal("help") },
            { icon: "info", label: "About Florish", action: () => setActiveModal("about") },
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

      {/* Privacy Modal */}
      <Modal visible={activeModal === "privacy"} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>
              {[
                { heading: "Data We Collect", body: "Florish stores your fitness profile, workout history, calorie logs, water intake, and progress photos locally on your device. No personal data is sent to third-party servers without your consent." },
                { heading: "How We Use Your Data", body: "Your data is used solely to personalise your fitness experience — providing workout recommendations, tracking your progress, and calculating nutrition goals. We never sell your data." },
                { heading: "Progress Photos", body: "Photos you upload for progress tracking are stored only on your device using secure local storage. They are never uploaded to any server." },
                { heading: "Subscriptions", body: "Subscription purchases are processed securely through RevenueCat and the App Store or Google Play. Florish never sees or stores your payment details." },
                { heading: "Third-Party Services", body: "We use RevenueCat for subscription management. Their privacy policy is available at revenuecat.com/privacy." },
                { heading: "Your Rights", body: "You can delete all your data at any time by tapping 'Log Out' and clearing app data from your device settings. Contact us at support@florish.app for any privacy concerns." },
              ].map((s) => (
                <View key={s.heading} style={styles.policySection}>
                  <Text style={[styles.policyHeading, { color: colors.foreground }]}>{s.heading}</Text>
                  <Text style={[styles.policyBody, { color: colors.mutedForeground }]}>{s.body}</Text>
                </View>
              ))}
              <Text style={[styles.policyFooter, { color: colors.mutedForeground }]}>Last updated: May 2026</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Help & Support Modal */}
      <Modal visible={activeModal === "help"} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Help & Support</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>
              {[
                { q: "How do I track my calories?", a: "Tap the Calories tab at the bottom. You can log meals manually, search our food database, or use the camera to scan your food." },
                { q: "How do workouts work?", a: "Go to the Workouts tab, tap any workout, and press Start Workout. Follow along with the on-screen timer and exercise instructions. Your session is saved automatically when you finish." },
                { q: "Can I add my own workout videos?", a: "Yes! Open any workout, and as an admin you'll see an Upload Demo Video button on each exercise. Tap it to attach a video from your library." },
                { q: "How do I track my water intake?", a: "Use the Water tab to log your daily intake. Tap the + buttons to add preset amounts, or enter a custom amount." },
                { q: "How do I cancel my subscription?", a: "Subscriptions are managed through the App Store (iOS) or Google Play (Android). Go to your device's subscription settings to cancel." },
                { q: "My question isn't listed here", a: "Email us at support@florish.app and we'll get back to you within 24 hours." },
              ].map((faq, i) => (
                <View key={i} style={[styles.faqItem, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.faqQ, { color: colors.foreground }]}>{faq.q}</Text>
                  <Text style={[styles.faqA, { color: colors.mutedForeground }]}>{faq.a}</Text>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: colors.primary }]}
                onPress={() => Linking.openURL("mailto:support@florish.app")}
              >
                <Feather name="mail" size={16} color="#fff" />
                <Text style={styles.contactBtnText}>Email Support</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* About Florish Modal */}
      <Modal visible={activeModal === "about"} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>About Florish</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>
              <View style={styles.aboutLogoRow}>
                <View style={[styles.aboutLogo, { backgroundColor: colors.primary }]}>
                  <Text style={styles.aboutLogoText}>F</Text>
                </View>
                <View>
                  <Text style={[styles.aboutAppName, { color: colors.foreground }]}>Florish</Text>
                  <Text style={[styles.aboutVersion, { color: colors.mutedForeground }]}>Version 1.0.0 · By Dillish</Text>
                </View>
              </View>
              <Text style={[styles.aboutDesc, { color: colors.mutedForeground }]}>
                Florish is a premium fitness app designed and curated by Dillish to help women worldwide achieve their health and fitness goals. With personalised workouts, AI-powered calorie tracking, and detailed progress insights, Florish makes your fitness journey feel effortless and enjoyable.
              </Text>
              <View style={[styles.aboutFeatures, { backgroundColor: colors.muted, borderRadius: 16 }]}>
                {[
                  { icon: "activity", text: "8+ curated workout programs" },
                  { icon: "pie-chart", text: "AI calorie & nutrition tracking" },
                  { icon: "droplet", text: "Smart hydration reminders" },
                  { icon: "trending-up", text: "Progress photo & weight tracking" },
                  { icon: "star", text: "Premium subscription plans" },
                ].map((f) => (
                  <View key={f.text} style={styles.aboutFeatureRow}>
                    <Feather name={f.icon as any} size={16} color={colors.primary} />
                    <Text style={[styles.aboutFeatureText, { color: colors.foreground }]}>{f.text}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.aboutLinks}>
                <TouchableOpacity onPress={() => Linking.openURL("mailto:hello@florish.app")} style={[styles.aboutLink, { borderColor: colors.border }]}>
                  <Feather name="mail" size={14} color={colors.primary} />
                  <Text style={[styles.aboutLinkText, { color: colors.primary }]}>hello@florish.app</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.aboutCopyright, { color: colors.mutedForeground }]}>
                © 2026 Florish. All rights reserved.
              </Text>
            </ScrollView>
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

  // Sheet modals (Privacy, Help, About)
  sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "85%", paddingBottom: 34 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 12 },
  sheetTitle: { fontSize: 18, fontWeight: "800" as const },
  sheetScroll: { paddingHorizontal: 20 },

  // Privacy
  policySection: { marginBottom: 18 },
  policyHeading: { fontSize: 14, fontWeight: "700" as const, marginBottom: 6 },
  policyBody: { fontSize: 14, lineHeight: 21 },
  policyFooter: { fontSize: 12, textAlign: "center" as const, marginVertical: 16 },

  // Help
  faqItem: { paddingVertical: 16, borderBottomWidth: 1 },
  faqQ: { fontSize: 14, fontWeight: "700" as const, marginBottom: 6 },
  faqA: { fontSize: 14, lineHeight: 20 },
  contactBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 20, marginBottom: 8 },
  contactBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" as const },

  // About
  aboutLogoRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 },
  aboutLogo: { width: 64, height: 64, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  aboutLogoText: { color: "#fff", fontSize: 28, fontWeight: "800" as const },
  aboutAppName: { fontSize: 22, fontWeight: "800" as const },
  aboutVersion: { fontSize: 13, marginTop: 2 },
  aboutDesc: { fontSize: 14, lineHeight: 21, marginBottom: 16 },
  aboutFeatures: { padding: 16, gap: 12, marginBottom: 16 },
  aboutFeatureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  aboutFeatureText: { fontSize: 14 },
  aboutLinks: { gap: 10, marginBottom: 16 },
  aboutLink: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
  aboutLinkText: { fontSize: 14, fontWeight: "600" as const },
  aboutCopyright: { fontSize: 12, textAlign: "center" as const, marginBottom: 8 },
});
