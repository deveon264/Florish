import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
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
import { getFeaturedWorkout } from "@/lib/workouts";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function CalorieRing({ consumed, goal, colors }: { consumed: number; goal: number; colors: any }) {
  const pct = Math.min((consumed / goal) * 100, 100);
  const remaining = Math.max(goal - consumed, 0);
  return (
    <View style={[ringStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={ringStyles.left}>
        <View style={[ringStyles.ringOuter, { borderColor: colors.muted }]}>
          <View style={[ringStyles.ringFill, { borderColor: colors.primary, borderTopColor: "transparent", transform: [{ rotate: `${(pct / 100) * 360}deg` }] }]} />
          <View style={ringStyles.ringCenter}>
            <Text style={[ringStyles.ringNum, { color: colors.foreground }]}>{consumed}</Text>
            <Text style={[ringStyles.ringLabel, { color: colors.mutedForeground }]}>cal</Text>
          </View>
        </View>
      </View>
      <View style={ringStyles.right}>
        <Text style={[ringStyles.title, { color: colors.foreground }]}>Calories</Text>
        {[
          { label: "Goal", value: goal, color: colors.primary },
          { label: "Consumed", value: consumed, color: colors.accent },
          { label: "Remaining", value: remaining, color: colors.success },
        ].map((r) => (
          <View key={r.label} style={ringStyles.row}>
            <View style={[ringStyles.dot, { backgroundColor: r.color }]} />
            <Text style={[ringStyles.rowLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
            <Text style={[ringStyles.rowVal, { color: colors.foreground }]}>{r.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 18, flexDirection: "row", gap: 16 },
  left: { justifyContent: "center" },
  ringOuter: { width: 90, height: 90, borderRadius: 45, borderWidth: 8, justifyContent: "center", alignItems: "center", position: "relative" as const },
  ringFill: { position: "absolute" as const, width: 90, height: 90, borderRadius: 45, borderWidth: 8, borderStyle: "solid" as const },
  ringCenter: { alignItems: "center" },
  ringNum: { fontSize: 20, fontWeight: "800" as const },
  ringLabel: { fontSize: 11 },
  right: { flex: 1, gap: 8, justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "700" as const, marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rowLabel: { flex: 1, fontSize: 13 },
  rowVal: { fontSize: 14, fontWeight: "700" as const },
});

function WaterWidget({ ml, goalMl, colors, onAdd }: { ml: number; goalMl: number; colors: any; onAdd: () => void }) {
  const glasses = Math.round(ml / 250);
  const goalGlasses = Math.round(goalMl / 250);
  const pct = Math.min(ml / goalMl, 1);
  return (
    <View style={[wStyles.card, { backgroundColor: "#EBF5FB", borderColor: "#A8D4F0" }]}>
      <View style={wStyles.header}>
        <Text style={[wStyles.title, { color: "#1A5276" }]}>Water</Text>
        <TouchableOpacity style={wStyles.addBtn} onPress={onAdd}>
          <Feather name="plus" size={16} color="#1A5276" />
        </TouchableOpacity>
      </View>
      <View style={wStyles.barOuter}>
        <View style={[wStyles.barFill, { width: `${pct * 100}%` as any, backgroundColor: "#5DADE2" }]} />
      </View>
      <Text style={[wStyles.stat, { color: "#1A5276" }]}>
        {glasses} / {goalGlasses} glasses · {(ml / 1000).toFixed(1)} L
      </Text>
    </View>
  );
}

const wStyles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "700" as const },
  addBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(93,173,226,0.2)", justifyContent: "center", alignItems: "center" },
  barOuter: { height: 8, backgroundColor: "rgba(93,173,226,0.2)", borderRadius: 4, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 4 },
  stat: { fontSize: 13, fontWeight: "500" as const },
});

function StreakWidget({ streak, colors }: { streak: number; colors: any }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date().getDay();
  return (
    <View style={[sStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={sStyles.header}>
        <Text style={[sStyles.title, { color: colors.foreground }]}>Weekly Streak</Text>
        <View style={[sStyles.badge, { backgroundColor: colors.primary }]}>
          <Feather name="zap" size={12} color="#fff" />
          <Text style={sStyles.badgeText}>{streak} days</Text>
        </View>
      </View>
      <View style={sStyles.dots}>
        {days.map((d, i) => {
          const dayIndex = (i + 1) % 7;
          const active = dayIndex <= (today === 0 ? 7 : today);
          return (
            <View key={i} style={sStyles.dayCol}>
              <View style={[sStyles.dot, { backgroundColor: active ? colors.primary : colors.muted }]}>
                {active && <Feather name="check" size={10} color="#fff" />}
              </View>
              <Text style={[sStyles.dayLabel, { color: colors.mutedForeground }]}>{d}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const sStyles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "700" as const },
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" as const },
  dots: { flexDirection: "row", justifyContent: "space-between" },
  dayCol: { alignItems: "center", gap: 6 },
  dot: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  dayLabel: { fontSize: 11, fontWeight: "600" as const },
});

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { todayCalories, todayWaterMl, streak, logWater } = useFitness();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const featured = getFeaturedWorkout();
  const calorieGoal = user?.dailyCalorieGoal ?? 1800;
  const waterGoal = user?.dailyWaterGoalMl ?? 2000;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: botPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting()}</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{user?.name?.split(" ")[0] ?? "Beautiful"} 🌸</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{(user?.name?.[0] ?? "F").toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.dillishBanner, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
        <Text style={[styles.dillishText, { color: colors.primaryDark }]}>
          ✨ Dillish says: "You're stronger than yesterday. Let's prove it today."
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Workout</Text>
      <TouchableOpacity
        style={[styles.featuredCard, { backgroundColor: featured.thumbnailColor + "22", borderColor: featured.thumbnailColor + "44" }]}
        onPress={() => router.push(`/workout/${featured.id}` as any)}
        activeOpacity={0.85}
      >
        <View style={[styles.featuredBadge, { backgroundColor: featured.thumbnailColor }]}>
          <Text style={styles.featuredBadgeText}>TODAY'S PICK</Text>
        </View>
        <Text style={[styles.featuredTitle, { color: colors.foreground }]}>{featured.title}</Text>
        <Text style={[styles.featuredSub, { color: colors.mutedForeground }]}>{featured.category}</Text>
        <View style={styles.featuredStats}>
          <View style={styles.featuredStat}>
            <Feather name="clock" size={14} color={colors.mutedForeground} />
            <Text style={[styles.featuredStatText, { color: colors.mutedForeground }]}>{featured.durationMinutes} min</Text>
          </View>
          <View style={styles.featuredStat}>
            <Feather name="zap" size={14} color={colors.mutedForeground} />
            <Text style={[styles.featuredStatText, { color: colors.mutedForeground }]}>{featured.caloriesBurned} cal</Text>
          </View>
          <View style={styles.featuredStat}>
            <Feather name="bar-chart-2" size={14} color={colors.mutedForeground} />
            <Text style={[styles.featuredStatText, { color: colors.mutedForeground }]}>{featured.difficulty}</Text>
          </View>
        </View>
        <View style={[styles.startWorkoutBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.startWorkoutText}>Start Workout</Text>
          <Feather name="play" size={14} color="#fff" />
        </View>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Nutrition</Text>
      <CalorieRing consumed={todayCalories} goal={calorieGoal} colors={colors} />

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Hydration</Text>
      <WaterWidget
        ml={todayWaterMl}
        goalMl={waterGoal}
        colors={colors}
        onAdd={() => logWater(250)}
      />

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Activity</Text>
      <StreakWidget streak={streak} colors={colors} />

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
      <View style={styles.quickActions}>
        {[
          { icon: "activity", label: "Workouts", route: "/(tabs)/workouts" },
          { icon: "camera", label: "Log Food", route: "/(tabs)/calories" },
          { icon: "droplet", label: "Water", route: "/(tabs)/water" },
          { icon: "trending-up", label: "Progress", route: "/(tabs)/progress" },
        ].map((a) => (
          <TouchableOpacity
            key={a.label}
            style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(a.route as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIcon, { backgroundColor: colors.primary + "20" }]}>
              <Feather name={a.icon as any} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.quickLabel, { color: colors.foreground }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  greeting: { fontSize: 14, fontWeight: "500" as const },
  name: { fontSize: 26, fontWeight: "800" as const, letterSpacing: -0.3 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" as const },
  dillishBanner: { borderRadius: 14, borderWidth: 1, padding: 14 },
  dillishText: { fontSize: 14, lineHeight: 20, fontStyle: "italic" as const, fontWeight: "500" as const },
  sectionTitle: { fontSize: 18, fontWeight: "800" as const, letterSpacing: -0.2 },
  featuredCard: { borderRadius: 20, borderWidth: 1.5, padding: 20, gap: 10 },
  featuredBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  featuredBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" as const, letterSpacing: 0.5 },
  featuredTitle: { fontSize: 22, fontWeight: "800" as const, letterSpacing: -0.3 },
  featuredSub: { fontSize: 14 },
  featuredStats: { flexDirection: "row", gap: 16 },
  featuredStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  featuredStatText: { fontSize: 13, fontWeight: "500" as const },
  startWorkoutBtn: {
    flexDirection: "row",
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  startWorkoutText: { color: "#fff", fontSize: 15, fontWeight: "700" as const },
  quickActions: { flexDirection: "row", gap: 12, flexWrap: "wrap" as const },
  quickAction: {
    flex: 1,
    minWidth: "40%",
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  quickIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  quickLabel: { fontSize: 13, fontWeight: "700" as const },
});
