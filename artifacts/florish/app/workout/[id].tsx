import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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
import { getWorkoutById } from "@/lib/workouts";
import { useFitness } from "@/context/FitnessContext";
import * as Haptics from "expo-haptics";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completeWorkout, toggleFavorite, favoriteWorkouts } = useFitness();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const workout = getWorkoutById(id ?? "");
  const [isActive, setIsActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const isFav = favoriteWorkouts.includes(id ?? "");

  useEffect(() => {
    if (workout && workout.exercises[currentExercise]) {
      const ex = workout.exercises[currentExercise]!;
      setTimeLeft(ex.durationSeconds ?? ex.restSeconds * 2);
    }
    return () => clearInterval(intervalRef.current ?? undefined);
  }, [currentExercise, workout]);

  useEffect(() => {
    if (!isActive) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleNextExercise();
          return 0;
        }
        return t - 1;
      });
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current ?? undefined);
  }, [isActive, currentExercise]);

  const handleNextExercise = () => {
    if (!workout) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (currentExercise < workout.exercises.length - 1) {
      setCurrentExercise((c) => c + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsActive(false);
    setIsCompleted(true);
    if (workout) {
      await completeWorkout(workout.id, Math.ceil(elapsed / 60));
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleToggleFav = async () => {
    await toggleFavorite(id ?? "");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!workout) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Workout not found</Text>
      </View>
    );
  }

  const ex = workout.exercises[currentExercise];
  const progress = workout.exercises.length > 0 ? (currentExercise / workout.exercises.length) : 0;

  if (isCompleted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.completedInner, { paddingTop: topPad + 40, paddingBottom: botPad + 24 }]}>
          <View style={[styles.completedIcon, { backgroundColor: colors.success }]}>
            <Feather name="check" size={48} color="#fff" />
          </View>
          <Text style={[styles.completedTitle, { color: colors.foreground }]}>Workout Complete!</Text>
          <Text style={[styles.completedSubtitle, { color: colors.mutedForeground }]}>
            Amazing work! You just crushed {workout.title}
          </Text>
          <View style={[styles.statsRow, { backgroundColor: colors.muted, borderRadius: 16 }]}>
            {[
              { icon: "zap", label: "Calories", value: `${workout.caloriesBurned}` },
              { icon: "clock", label: "Duration", value: `${Math.ceil(elapsed / 60)} min` },
              { icon: "list", label: "Exercises", value: `${workout.exercises.length}` },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Feather name={s.icon as any} size={20} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.doneBtnText, { color: "#fff" }]}>Back to Workouts</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="x" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.progressBarOuter}>
          <View style={[styles.progressBarInner, { backgroundColor: colors.primary, width: `${progress * 100}%` as any }]} />
        </View>
        <TouchableOpacity onPress={handleToggleFav} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="heart" size={22} color={isFav ? colors.primary : colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.colorHero, { backgroundColor: workout.thumbnailColor + "33" }]}>
          <Text style={[styles.exerciseNumber, { color: colors.mutedForeground }]}>
            {currentExercise + 1} / {workout.exercises.length}
          </Text>
          <Text style={[styles.exerciseName, { color: colors.foreground }]}>{ex?.name ?? "Rest"}</Text>
          {isActive && ex?.durationSeconds && (
            <View style={[styles.timerCircle, { borderColor: colors.primary }]}>
              <Text style={[styles.timerText, { color: colors.primary }]}>{timeLeft}s</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {ex && (
            <View style={[styles.instructionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.instructionLabel, { color: colors.mutedForeground }]}>Instructions</Text>
              <Text style={[styles.instructionText, { color: colors.foreground }]}>{ex.instructions}</Text>
              <View style={styles.exerciseMeta}>
                {ex.sets && (
                  <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{ex.sets} sets</Text>
                  </View>
                )}
                {ex.reps && (
                  <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{ex.reps} reps</Text>
                  </View>
                )}
                {ex.durationSeconds && (
                  <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{ex.durationSeconds}s</Text>
                  </View>
                )}
                <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{ex.restSeconds}s rest</Text>
                </View>
              </View>
            </View>
          )}

          <Text style={[styles.allExercisesLabel, { color: colors.mutedForeground }]}>All Exercises</Text>
          {workout.exercises.map((e, i) => (
            <View
              key={i}
              style={[
                styles.exerciseRow,
                {
                  backgroundColor: i === currentExercise ? colors.primary + "15" : colors.card,
                  borderColor: i === currentExercise ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={[styles.exerciseNumCircle, { backgroundColor: i < currentExercise ? colors.success : i === currentExercise ? colors.primary : colors.muted }]}>
                {i < currentExercise ? (
                  <Feather name="check" size={12} color="#fff" />
                ) : (
                  <Text style={[styles.exerciseNumText, { color: i === currentExercise ? "#fff" : colors.mutedForeground }]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.exerciseRowName, { color: colors.foreground }]}>{e.name}</Text>
              <Text style={[styles.exerciseRowMeta, { color: colors.mutedForeground }]}>
                {e.durationSeconds ? `${e.durationSeconds}s` : `${e.sets}×${e.reps}`}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.controls, { paddingBottom: botPad + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {!isActive ? (
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setIsActive(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <Feather name="play" size={22} color="#fff" />
            <Text style={styles.startBtnText}>
              {currentExercise === 0 ? "Start Workout" : "Resume"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            <TouchableOpacity
              style={[styles.pauseBtn, { backgroundColor: colors.muted }]}
              onPress={() => {
                setIsActive(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Feather name="pause" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: colors.primary }]}
              onPress={handleNextExercise}
            >
              <Text style={styles.nextBtnText}>
                {currentExercise < workout.exercises.length - 1 ? "Next Exercise" : "Finish"}
              </Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  progressBarOuter: { flex: 1, height: 4, backgroundColor: "#eee", borderRadius: 2, overflow: "hidden" },
  progressBarInner: { height: 4, borderRadius: 2 },
  scroll: { flexGrow: 1 },
  colorHero: {
    minHeight: 180,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  exerciseNumber: { fontSize: 13, fontWeight: "600" as const },
  exerciseName: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.5, textAlign: "center" },
  timerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: { fontSize: 28, fontWeight: "800" as const },
  content: { padding: 16, gap: 12 },
  instructionCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 10 },
  instructionLabel: { fontSize: 12, fontWeight: "600" as const, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  instructionText: { fontSize: 15, lineHeight: 22 },
  exerciseMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  metaText: { fontSize: 12, fontWeight: "600" as const },
  allExercisesLabel: { fontSize: 13, fontWeight: "600" as const, textTransform: "uppercase" as const, letterSpacing: 0.5, marginTop: 4 },
  exerciseRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1, gap: 12 },
  exerciseNumCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  exerciseNumText: { fontSize: 12, fontWeight: "700" as const },
  exerciseRowName: { flex: 1, fontSize: 14, fontWeight: "600" as const },
  exerciseRowMeta: { fontSize: 12 },
  controls: {
    padding: 16,
    borderTopWidth: 1,
  },
  startBtn: {
    flexDirection: "row",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  startBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" as const },
  activeControls: { flexDirection: "row", gap: 12 },
  pauseBtn: { width: 56, height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" as const },
  completedInner: { flex: 1, paddingHorizontal: 24, alignItems: "center", gap: 20 },
  completedIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center" },
  completedTitle: { fontSize: 28, fontWeight: "800" as const },
  completedSubtitle: { fontSize: 16, textAlign: "center", lineHeight: 22 },
  statsRow: { flexDirection: "row", width: "100%", padding: 20 },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontWeight: "800" as const },
  statLabel: { fontSize: 12 },
  doneBtn: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  doneBtnText: { fontSize: 17, fontWeight: "700" as const },
});
