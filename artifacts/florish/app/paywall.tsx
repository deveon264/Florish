import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { useSubscription } from "@/lib/revenuecat";
import * as Haptics from "expo-haptics";

const FEATURES = [
  "Unlimited workout library access",
  "AI calorie & food tracking",
  "Progress photo storage",
  "Daily water intake tracking",
  "Weekly streak & achievements",
  "Personalised workout plans",
];

type PlanKey = "weekly" | "monthly" | "yearly";

export default function PaywallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completePaywall } = useAuth();
  const { offerings, purchase, isPurchasing, restore, isRestoring, isSubscribed } = useSubscription();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selected, setSelected] = useState<PlanKey>("yearly");
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmPkg, setConfirmPkg] = useState<any>(null);

  if (isSubscribed) {
    completePaywall().then(() => router.replace("/(tabs)"));
    return null;
  }

  const currentOffering = offerings?.current;
  const packages = currentOffering?.availablePackages ?? [];

  const getPlan = (key: PlanKey) => {
    const lookup: Record<PlanKey, string> = {
      weekly: "$rc_weekly",
      monthly: "$rc_monthly",
      yearly: "$rc_annual",
    };
    return packages.find((p) => p.packageType === lookup[key] || p.identifier === lookup[key]);
  };

  const PLANS: { key: PlanKey; label: string; period: string; badge?: string; color: string }[] = [
    { key: "weekly", label: "Weekly", period: "/ week", color: colors.muted },
    { key: "monthly", label: "Monthly", period: "/ month", color: colors.muted },
    { key: "yearly", label: "Yearly", period: "/ year", badge: "BEST VALUE", color: colors.primary + "15" },
  ];

  const handlePurchase = async () => {
    const pkg = getPlan(selected);
    if (!pkg) {
      await completePaywall();
      router.replace("/(tabs)");
      return;
    }
    if (__DEV__) {
      setConfirmPkg(pkg);
      setConfirmModal(true);
    } else {
      try {
        await purchase(pkg);
        await completePaywall();
        router.replace("/(tabs)");
      } catch {}
    }
  };

  const confirmPurchase = async () => {
    setConfirmModal(false);
    if (confirmPkg) {
      try {
        await purchase(confirmPkg);
        await completePaywall();
        router.replace("/(tabs)");
      } catch {
        await completePaywall();
        router.replace("/(tabs)");
      }
    }
  };

  const getPrice = (key: PlanKey): string => {
    const pkg = getPlan(key);
    if (pkg) return pkg.product.priceString;
    const fallback: Record<PlanKey, string> = { weekly: "$2.99", monthly: "$4.99", yearly: "$49.99" };
    return fallback[key];
  };

  const handleRestore = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await restore();
      if (isSubscribed) {
        await completePaywall();
        router.replace("/(tabs)");
      }
    } catch {}
  };

  const handleSkip = async () => {
    await completePaywall();
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: "#fff" }]}>FLORISH PREMIUM</Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Transform with{"\n"}Dillish
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Unlock your full fitness potential
          </Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                <Feather name="check" size={12} color="#fff" />
              </View>
              <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          {PLANS.map((plan) => {
            const isSelected = selected === plan.key;
            return (
              <TouchableOpacity
                key={plan.key}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: isSelected ? plan.color : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  setSelected(plan.key);
                  Haptics.selectionAsync();
                }}
                activeOpacity={0.85}
              >
                {plan.badge && (
                  <View style={[styles.bestBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.bestBadgeText}>{plan.badge}</Text>
                  </View>
                )}
                <Text style={[styles.planLabel, { color: colors.foreground }]}>{plan.label}</Text>
                <View style={styles.planPriceRow}>
                  <Text style={[styles.planPrice, { color: colors.primary }]}>{getPrice(plan.key)}</Text>
                  <Text style={[styles.planPeriod, { color: colors.mutedForeground }]}>{plan.period}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          7-day free trial available on production. Cancel anytime.
        </Text>

        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
          onPress={handlePurchase}
          activeOpacity={0.85}
          disabled={isPurchasing}
        >
          {isPurchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.ctaBtnText, { color: colors.primaryForeground }]}>
              Start Free Trial
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRestore} disabled={isRestoring}>
          <Text style={[styles.restoreText, { color: colors.mutedForeground }]}>
            {isRestoring ? "Restoring..." : "Restore Purchases"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={confirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Confirm Purchase</Text>
            <Text style={[styles.modalBody, { color: colors.mutedForeground }]}>
              This is a test purchase in development mode. Proceed?
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.muted }]}
                onPress={() => setConfirmModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={confirmPurchase}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>Purchase</Text>
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
  scroll: { paddingHorizontal: 24, gap: 24 },
  skipBtn: { alignSelf: "flex-end" },
  skipText: { fontSize: 14, fontWeight: "500" as const },
  header: { gap: 10 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: "800" as const, letterSpacing: 1 },
  title: { fontSize: 32, fontWeight: "800" as const, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  features: { gap: 12 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkCircle: { width: 22, height: 22, borderRadius: 11, justifyContent: "center", alignItems: "center" },
  featureText: { fontSize: 15, fontWeight: "500" as const, flex: 1 },
  plans: { flexDirection: "row", gap: 10 },
  planCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    gap: 6,
    position: "relative" as const,
    overflow: "hidden",
  },
  bestBadge: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    alignItems: "center",
  },
  bestBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" as const, letterSpacing: 0.5 },
  planLabel: { fontSize: 14, fontWeight: "700" as const, marginTop: 16 },
  planPriceRow: { alignItems: "center" },
  planPrice: { fontSize: 20, fontWeight: "800" as const },
  planPeriod: { fontSize: 11 },
  note: { fontSize: 12, textAlign: "center", lineHeight: 18 },
  ctaBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  ctaBtnText: { fontSize: 17, fontWeight: "700" as const },
  restoreText: { fontSize: 13, textAlign: "center", textDecorationLine: "underline" as const },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: { borderRadius: 20, padding: 24, gap: 16, width: "100%" as any },
  modalTitle: { fontSize: 18, fontWeight: "700" as const },
  modalBody: { fontSize: 14, lineHeight: 20 },
  modalBtns: { flexDirection: "row", gap: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center" },
  modalBtnText: { fontSize: 15, fontWeight: "600" as const },
});
