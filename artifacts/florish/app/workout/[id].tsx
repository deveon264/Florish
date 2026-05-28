import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
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
import { useAuth } from "@/context/AuthContext";
import {
  getExerciseVideos,
  setExerciseVideo,
  deleteExerciseVideo,
  type ExerciseVideo,
} from "@/lib/storage";
import * as Haptics from "expo-haptics";

function ExerciseVideoPlayer({ uri, shouldPlay, height = 220 }: { uri: string; shouldPlay: boolean; height?: number }) {
  const [VideoComp, setVideoComp] = useState<any>(null);
  const videoRef = useRef<any>(null);

  useEffect(() => {
    import("expo-av").then(({ Video, ResizeMode }) => {
      setVideoComp({ Video, ResizeMode });
    });
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    if (shouldPlay) {
      videoRef.current.playAsync?.();
    } else {
      videoRef.current.pauseAsync?.();
    }
  }, [shouldPlay]);

  if (!VideoComp) {
    return (
      <View style={styles.videoLoading}>
        <Feather name="loader" size={24} color="#aaa" />
      </View>
    );
  }

  const { Video, ResizeMode } = VideoComp;
  return (
    <Video
      ref={videoRef}
      source={{ uri }}
      style={[styles.videoPlayer, { height }]}
      useNativeControls
      resizeMode={ResizeMode.COVER}
      shouldPlay={shouldPlay}
      isLooping
    />
  );
}

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completeWorkout, toggleFavorite, favoriteWorkouts } = useFitness();
  const { isAdmin } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const workout = getWorkoutById(id ?? "");
  const [isActive, setIsActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [exerciseVideos, setExerciseVideos] = useState<Record<string, ExerciseVideo>>({});
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [showVideoFor, setShowVideoFor] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isFav = favoriteWorkouts.includes(id ?? "");

  useEffect(() => {
    getExerciseVideos().then(setExerciseVideos);
  }, []);

  useEffect(() => {
    if (workout && workout.exercises[currentExercise]) {
      const ex = workout.exercises[currentExercise]!;
      const dur = ex.durationSeconds ?? ex.restSeconds * 2;
      setTimeLeft(dur);
      setTotalDuration(dur);
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

  // Rest period countdown
  useEffect(() => {
    if (!isResting) {
      clearInterval(restIntervalRef.current ?? undefined);
      return;
    }
    restIntervalRef.current = setInterval(() => {
      setRestTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(restIntervalRef.current ?? undefined);
          setIsResting(false);
          setCurrentExercise((c) => c + 1);
          return 0;
        }
        return t - 1;
      });
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(restIntervalRef.current ?? undefined);
  }, [isResting]);

  const startRest = (restSeconds: number) => {
    clearInterval(intervalRef.current ?? undefined);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRestTimeLeft(restSeconds);
    setRestTotal(restSeconds);
    setIsResting(true);
  };

  const handleNextExercise = () => {
    if (!workout) return;
    const ex = workout.exercises[currentExercise];
    const isLast = currentExercise >= workout.exercises.length - 1;
    if (isLast) {
      handleComplete();
    } else if (isActive && ex && ex.restSeconds > 0) {
      startRest(ex.restSeconds);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCurrentExercise((c) => c + 1);
    }
  };

  const skipRest = () => {
    clearInterval(restIntervalRef.current ?? undefined);
    setIsResting(false);
    setCurrentExercise((c) => c + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const handleUploadVideo = async (exerciseName: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your media library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: false,
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;
    setUploadingFor(exerciseName);
    try {
      const saved = await setExerciseVideo(exerciseName, result.assets[0].uri);
      setExerciseVideos((prev) => ({ ...prev, [exerciseName.toLowerCase()]: saved }));
    } finally {
      setUploadingFor(null);
    }
  };

  const handleDeleteVideo = (exerciseName: string) => {
    Alert.alert("Remove Video", `Remove the demo video for "${exerciseName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await deleteExerciseVideo(exerciseName);
          setExerciseVideos((prev) => {
            const next = { ...prev };
            delete next[exerciseName.toLowerCase()];
            return next;
          });
          if (showVideoFor === exerciseName) setShowVideoFor(null);
        },
      },
    ]);
  };

  if (!workout) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Workout not found</Text>
      </View>
    );
  }

  const ex = workout.exercises[currentExercise];
  const progress = workout.exercises.length > 0 ? currentExercise / workout.exercises.length : 0;
  const currentVideoKey = ex?.name.toLowerCase() ?? "";
  const currentVideo = exerciseVideos[currentVideoKey];

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
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 24 }]} showsVerticalScrollIndicator={false}>
        {/* Hero: video player if available, else coloured banner */}
        {currentVideo ? (
          <View style={[styles.videoHero, { height: 220 + topPad + 48 }]}>
            <ExerciseVideoPlayer uri={currentVideo.uri} shouldPlay={isActive} height={220 + topPad + 48} />
            {/* Dark gradient behind top controls */}
            <View style={[styles.heroTopGradient, { paddingTop: topPad + 8 }]}>
              <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={[styles.progressBarOuter, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
                <View style={[styles.progressBarInner, { backgroundColor: "#fff", width: `${progress * 100}%` as any }]} />
              </View>
              <TouchableOpacity onPress={handleToggleFav} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="heart" size={22} color={isFav ? colors.primary : "rgba(255,255,255,0.85)"} />
              </TouchableOpacity>
            </View>
            {isAdmin && (
              <TouchableOpacity
                style={styles.videoDeleteBtn}
                onPress={() => handleDeleteVideo(ex!.name)}
              >
                <Feather name="trash-2" size={14} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={[styles.colorHero, { backgroundColor: workout.thumbnailColor + "33", paddingTop: topPad + 56 }]}>
            {/* Controls row overlaid at top */}
            <View style={[styles.heroTopGradient, { paddingTop: topPad + 8, backgroundColor: "transparent" }]}>
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
            {isAdmin && ex && (
              <TouchableOpacity
                style={[styles.uploadVideoBtn, { backgroundColor: colors.primary }]}
                onPress={() => handleUploadVideo(ex.name)}
                disabled={uploadingFor === ex.name}
              >
                <Feather name={uploadingFor === ex.name ? "loader" : "upload"} size={14} color="#fff" />
                <Text style={styles.uploadVideoBtnText}>
                  {uploadingFor === ex.name ? "Uploading…" : "Upload Demo Video"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Exercise name row — always shown below hero */}
        <View style={[styles.exerciseInfoRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.exerciseInfoNumber, { color: colors.mutedForeground }]}>
              {currentExercise + 1} / {workout.exercises.length}
            </Text>
            <Text style={[styles.exerciseInfoName, { color: colors.foreground }]}>{ex?.name ?? "Rest"}</Text>
          </View>
          {isActive && totalDuration > 0 && (
            <View style={[styles.videoTimerBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.videoTimerText}>{timeLeft}s</Text>
            </View>
          )}
        </View>

        {/* Exercise timer progress bar (shown below hero when active) */}
        {isActive && totalDuration > 0 && (
          <View style={[styles.timerBarWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={[styles.timerBarTrack, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  styles.timerBarFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${Math.max(0, (timeLeft / totalDuration) * 100)}%` as any,
                  },
                ]}
              />
            </View>
            <Text style={[styles.timerBarLabel, { color: colors.mutedForeground }]}>
              {timeLeft}s remaining
            </Text>
          </View>
        )}

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
          {workout.exercises.map((e, i) => {
            const hasVideo = !!exerciseVideos[e.name.toLowerCase()];
            const isUploading = uploadingFor === e.name;
            const isCurrent = i === currentExercise;
            return (
              <View
                key={i}
                style={[
                  styles.exerciseRow,
                  {
                    backgroundColor: isCurrent ? colors.primary + "15" : colors.card,
                    borderColor: isCurrent ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={[styles.exerciseNumCircle, { backgroundColor: i < currentExercise ? colors.success : isCurrent ? colors.primary : colors.muted }]}>
                  {i < currentExercise ? (
                    <Feather name="check" size={12} color="#fff" />
                  ) : (
                    <Text style={[styles.exerciseNumText, { color: isCurrent ? "#fff" : colors.mutedForeground }]}>{i + 1}</Text>
                  )}
                </View>
                <Text style={[styles.exerciseRowName, { color: colors.foreground }]}>{e.name}</Text>
                <View style={styles.exerciseRowActions}>
                  <Text style={[styles.exerciseRowMeta, { color: colors.mutedForeground }]}>
                    {e.durationSeconds ? `${e.durationSeconds}s` : `${e.sets}×${e.reps}`}
                  </Text>
                  {hasVideo && (
                    <View style={[styles.videoBadge, { backgroundColor: colors.primary + "20" }]}>
                      <Feather name="video" size={11} color={colors.primary} />
                    </View>
                  )}
                  {isAdmin && (
                    <TouchableOpacity
                      onPress={() => hasVideo ? handleDeleteVideo(e.name) : handleUploadVideo(e.name)}
                      disabled={isUploading}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={[styles.rowUploadBtn, { backgroundColor: hasVideo ? colors.destructive + "15" : colors.muted }]}
                    >
                      <Feather
                        name={isUploading ? "loader" : hasVideo ? "trash-2" : "upload"}
                        size={12}
                        color={hasVideo ? colors.destructive : colors.mutedForeground}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
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

      {/* Rest period overlay */}
      {isResting && (
        <View style={[styles.restOverlay, { backgroundColor: colors.background }]}>
          <View style={styles.restInner}>
            <Text style={[styles.restLabel, { color: colors.mutedForeground }]}>TAKE A BREATHER</Text>

            <View style={[styles.restRing, { borderColor: colors.primary + "30" }]}>
              <View style={[styles.restRingFill, { borderColor: colors.primary }]}>
                <Text style={[styles.restCountdown, { color: colors.primary }]}>{restTimeLeft}</Text>
                <Text style={[styles.restSec, { color: colors.mutedForeground }]}>seconds</Text>
              </View>
            </View>

            <View style={[styles.restProgressTrack, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  styles.restProgressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${Math.max(0, (restTimeLeft / restTotal) * 100)}%` as any,
                  },
                ]}
              />
            </View>

            {workout.exercises[currentExercise + 1] && (
              <View style={[styles.nextUpCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.nextUpLabel, { color: colors.mutedForeground }]}>UP NEXT</Text>
                <Text style={[styles.nextUpName, { color: colors.foreground }]}>
                  {workout.exercises[currentExercise + 1]!.name}
                </Text>
                <Text style={[styles.nextUpMeta, { color: colors.mutedForeground }]}>
                  {workout.exercises[currentExercise + 1]!.durationSeconds
                    ? `${workout.exercises[currentExercise + 1]!.durationSeconds}s`
                    : `${workout.exercises[currentExercise + 1]!.sets} × ${workout.exercises[currentExercise + 1]!.reps} reps`}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.skipRestBtn, { backgroundColor: colors.muted }]}
              onPress={skipRest}
              activeOpacity={0.8}
            >
              <Text style={[styles.skipRestText, { color: colors.foreground }]}>Skip Rest</Text>
              <Feather name="skip-forward" size={16} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroTopGradient: {
    position: "absolute" as const,
    top: 0, left: 0, right: 0,
    flexDirection: "row" as const,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  progressBarOuter: { flex: 1, height: 4, backgroundColor: "#eee", borderRadius: 2, overflow: "hidden" },
  progressBarInner: { height: 4, borderRadius: 2 },
  scroll: { flexGrow: 1 },

  // Video hero
  videoHero: { position: "relative" as const, backgroundColor: "#000", height: 220 },
  videoPlayer: { width: "100%", height: 220 },
  videoLoading: { height: 220, justifyContent: "center", alignItems: "center", backgroundColor: "#111" },
  videoHeroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    gap: 8,
  },
  videoOverlayRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  videoExerciseNumber: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "600" as const },
  videoExerciseName: { fontSize: 18, color: "#fff", fontWeight: "800" as const },
  videoTimerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 52,
    alignItems: "center",
  },
  videoTimerText: { fontSize: 16, fontWeight: "800" as const, color: "#fff" },
  videoProgressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 2,
    overflow: "hidden",
  },
  videoProgressFill: { height: 4, borderRadius: 2 },
  videoDeleteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 16,
    padding: 6,
  },
  exerciseInfoRow: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  exerciseInfoNumber: { fontSize: 12, fontWeight: "600" as const, marginBottom: 2 },
  exerciseInfoName: { fontSize: 20, fontWeight: "800" as const },
  timerBarWrap: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  timerBarTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  timerBarFill: { height: 4, borderRadius: 2 },
  timerBarLabel: { fontSize: 12, fontWeight: "600" as const, textAlign: "right" as const },

  // Color hero (no video)
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
  uploadVideoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  uploadVideoBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" as const },

  // Content
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
  exerciseRowActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  exerciseRowMeta: { fontSize: 12 },
  videoBadge: { borderRadius: 6, padding: 4 },
  rowUploadBtn: { borderRadius: 6, padding: 5 },

  // Controls
  controls: { padding: 16, borderTopWidth: 1 },
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

  // Completed
  completedInner: { flex: 1, paddingHorizontal: 24, alignItems: "center", gap: 20 },
  completedIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center" },
  completedTitle: { fontSize: 28, fontWeight: "800" as const },
  completedSubtitle: { fontSize: 16, textAlign: "center", lineHeight: 22 },
  statsRow: { flexDirection: "row", width: "100%", padding: 20 },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontWeight: "800" as const },
  statLabel: { fontSize: 12 },
  doneBtn: { width: "100%", paddingVertical: 18, borderRadius: 16, alignItems: "center", marginTop: 20 },
  doneBtnText: { fontSize: 17, fontWeight: "700" as const },

  // Rest overlay
  restOverlay: {
    position: "absolute" as const,
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  restInner: { width: "100%", paddingHorizontal: 32, alignItems: "center", gap: 24 },
  restLabel: { fontSize: 13, fontWeight: "700" as const, letterSpacing: 1.5, textTransform: "uppercase" as const },
  restRing: {
    width: 160, height: 160, borderRadius: 80, borderWidth: 10,
    justifyContent: "center", alignItems: "center",
  },
  restRingFill: {
    width: 136, height: 136, borderRadius: 68, borderWidth: 4,
    justifyContent: "center", alignItems: "center", gap: 2,
  },
  restCountdown: { fontSize: 56, fontWeight: "900" as const, lineHeight: 60 },
  restSec: { fontSize: 13, fontWeight: "600" as const },
  restProgressTrack: { width: "100%", height: 6, borderRadius: 3, overflow: "hidden" as const },
  restProgressFill: { height: 6, borderRadius: 3 },
  nextUpCard: {
    width: "100%", padding: 16, borderRadius: 16, borderWidth: 1, gap: 4,
  },
  nextUpLabel: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 1, textTransform: "uppercase" as const },
  nextUpName: { fontSize: 20, fontWeight: "800" as const },
  nextUpMeta: { fontSize: 13 },
  skipRestBtn: {
    flexDirection: "row" as const, alignItems: "center", gap: 8,
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14,
  },
  skipRestText: { fontSize: 15, fontWeight: "600" as const },
});
