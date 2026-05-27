import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  USER_PROFILE: "florish_user_profile",
  ONBOARDING_COMPLETE: "florish_onboarding_complete",
  PAYWALL_PASSED: "florish_paywall_passed",
  SESSION_ACTIVE: "florish_session_active",
  WATER_LOG: "florish_water_log",
  MEAL_LOG: "florish_meal_log",
  WORKOUT_HISTORY: "florish_workout_history",
  FAVORITE_WORKOUTS: "florish_favorite_workouts",
  WEIGHT_LOG: "florish_weight_log",
  PROGRESS_PHOTOS: "florish_progress_photos",
  STREAK: "florish_streak",
  CUSTOM_VIDEOS: "florish_custom_videos",
};

export type UserProfile = {
  name: string;
  email: string;
  fitnessGoal: "lose_weight" | "tone_up" | "build_strength" | "general_fitness";
  age: number;
  weightKg: number;
  heightCm: number;
  dailyWaterGoalMl: number;
  dailyCalorieGoal: number;
  createdAt: string;
};

export type WaterEntry = {
  id: string;
  amountMl: number;
  timestamp: string;
  date: string;
};

export type MealEntry = {
  id: string;
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
  date: string;
  imageUri?: string;
};

export type WorkoutHistoryEntry = {
  workoutId: string;
  completedAt: string;
  durationMinutes: number;
};

export type WeightEntry = {
  id: string;
  weightKg: number;
  date: string;
};

export type ProgressPhoto = {
  id: string;
  uri: string;
  date: string;
  note?: string;
};

function uid(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function todayDate(): string {
  return new Date().toISOString().split("T")[0]!;
}

// User profile
export async function getUserProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function isOnboardingComplete(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
  return val === "true";
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, "true");
}

export async function isPaywallPassed(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.PAYWALL_PASSED);
  return val === "true";
}

export async function setPaywallPassed(): Promise<void> {
  await AsyncStorage.setItem(KEYS.PAYWALL_PASSED, "true");
}

export async function isSessionActive(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.SESSION_ACTIVE);
  return val === "true";
}

export async function setSessionActive(active: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.SESSION_ACTIVE, active ? "true" : "false");
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.SESSION_ACTIVE, KEYS.ONBOARDING_COMPLETE, KEYS.PAYWALL_PASSED]);
}

// Water
export async function getTodayWaterEntries(): Promise<WaterEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.WATER_LOG);
  const all: WaterEntry[] = raw ? JSON.parse(raw) : [];
  return all.filter((e) => e.date === todayDate());
}

export async function addWaterEntry(amountMl: number): Promise<WaterEntry> {
  const raw = await AsyncStorage.getItem(KEYS.WATER_LOG);
  const all: WaterEntry[] = raw ? JSON.parse(raw) : [];
  const entry: WaterEntry = {
    id: uid(),
    amountMl,
    timestamp: new Date().toISOString(),
    date: todayDate(),
  };
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const filtered = all.filter((e) => new Date(e.date) > cutoff);
  filtered.push(entry);
  await AsyncStorage.setItem(KEYS.WATER_LOG, JSON.stringify(filtered));
  return entry;
}

export async function getWaterHistoryByDate(): Promise<
  Record<string, number>
> {
  const raw = await AsyncStorage.getItem(KEYS.WATER_LOG);
  const all: WaterEntry[] = raw ? JSON.parse(raw) : [];
  const byDate: Record<string, number> = {};
  for (const e of all) {
    byDate[e.date] = (byDate[e.date] ?? 0) + e.amountMl;
  }
  return byDate;
}

// Meals
export async function getTodayMeals(): Promise<MealEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.MEAL_LOG);
  const all: MealEntry[] = raw ? JSON.parse(raw) : [];
  return all.filter((e) => e.date === todayDate());
}

export async function addMealEntry(
  meal: Omit<MealEntry, "id" | "timestamp" | "date">
): Promise<MealEntry> {
  const raw = await AsyncStorage.getItem(KEYS.MEAL_LOG);
  const all: MealEntry[] = raw ? JSON.parse(raw) : [];
  const entry: MealEntry = {
    ...meal,
    id: uid(),
    timestamp: new Date().toISOString(),
    date: todayDate(),
  };
  all.push(entry);
  await AsyncStorage.setItem(KEYS.MEAL_LOG, JSON.stringify(all));
  return entry;
}

export async function deleteMealEntry(id: string): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.MEAL_LOG);
  const all: MealEntry[] = raw ? JSON.parse(raw) : [];
  await AsyncStorage.setItem(
    KEYS.MEAL_LOG,
    JSON.stringify(all.filter((e) => e.id !== id))
  );
}

// Workouts
export async function getWorkoutHistory(): Promise<WorkoutHistoryEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.WORKOUT_HISTORY);
  return raw ? JSON.parse(raw) : [];
}

export async function logWorkoutCompletion(
  workoutId: string,
  durationMinutes: number
): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.WORKOUT_HISTORY);
  const all: WorkoutHistoryEntry[] = raw ? JSON.parse(raw) : [];
  all.push({
    workoutId,
    completedAt: new Date().toISOString(),
    durationMinutes,
  });
  await AsyncStorage.setItem(KEYS.WORKOUT_HISTORY, JSON.stringify(all));
}

export async function getFavoriteWorkouts(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEYS.FAVORITE_WORKOUTS);
  return raw ? JSON.parse(raw) : [];
}

export async function toggleFavoriteWorkout(workoutId: string): Promise<boolean> {
  const favs = await getFavoriteWorkouts();
  let updated: string[];
  let isFav: boolean;
  if (favs.includes(workoutId)) {
    updated = favs.filter((id) => id !== workoutId);
    isFav = false;
  } else {
    updated = [...favs, workoutId];
    isFav = true;
  }
  await AsyncStorage.setItem(KEYS.FAVORITE_WORKOUTS, JSON.stringify(updated));
  return isFav;
}

// Weight
export async function getWeightLog(): Promise<WeightEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.WEIGHT_LOG);
  return raw ? JSON.parse(raw) : [];
}

export async function addWeightEntry(weightKg: number): Promise<WeightEntry> {
  const raw = await AsyncStorage.getItem(KEYS.WEIGHT_LOG);
  const all: WeightEntry[] = raw ? JSON.parse(raw) : [];
  const entry: WeightEntry = {
    id: uid(),
    weightKg,
    date: todayDate(),
  };
  all.push(entry);
  await AsyncStorage.setItem(KEYS.WEIGHT_LOG, JSON.stringify(all));
  return entry;
}

// Progress photos
export async function getProgressPhotos(): Promise<ProgressPhoto[]> {
  const raw = await AsyncStorage.getItem(KEYS.PROGRESS_PHOTOS);
  return raw ? JSON.parse(raw) : [];
}

export async function addProgressPhoto(
  uri: string,
  note?: string
): Promise<ProgressPhoto> {
  const raw = await AsyncStorage.getItem(KEYS.PROGRESS_PHOTOS);
  const all: ProgressPhoto[] = raw ? JSON.parse(raw) : [];
  const entry: ProgressPhoto = {
    id: uid(),
    uri,
    date: todayDate(),
    note,
  };
  all.push(entry);
  await AsyncStorage.setItem(KEYS.PROGRESS_PHOTOS, JSON.stringify(all));
  return entry;
}

// Streak
export async function getStreak(): Promise<number> {
  const raw = await AsyncStorage.getItem(KEYS.STREAK);
  return raw ? parseInt(raw, 10) : 0;
}

export async function updateStreak(): Promise<number> {
  const history = await getWorkoutHistory();
  if (history.length === 0) return 0;

  const dates = [
    ...new Set(history.map((h) => h.completedAt.split("T")[0])),
  ].sort((a, b) => b!.localeCompare(a!)) as string[];

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const d1 = new Date(dates[i]!);
    const d2 = new Date(dates[i + 1]!);
    const diff = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 1) {
      streak++;
    } else {
      break;
    }
  }

  await AsyncStorage.setItem(KEYS.STREAK, streak.toString());
  return streak;
}

// Exercise demo videos (admin-uploaded, keyed by exercise name)
export type ExerciseVideo = {
  id: string;
  exerciseName: string;
  uri: string;
  createdAt: string;
};

export async function getExerciseVideos(): Promise<Record<string, ExerciseVideo>> {
  const raw = await AsyncStorage.getItem("florish_exercise_videos");
  return raw ? JSON.parse(raw) : {};
}

export async function setExerciseVideo(
  exerciseName: string,
  uri: string
): Promise<ExerciseVideo> {
  const all = await getExerciseVideos();
  const entry: ExerciseVideo = {
    id: uid(),
    exerciseName,
    uri,
    createdAt: new Date().toISOString(),
  };
  all[exerciseName.toLowerCase()] = entry;
  await AsyncStorage.setItem("florish_exercise_videos", JSON.stringify(all));
  return entry;
}

export async function deleteExerciseVideo(exerciseName: string): Promise<void> {
  const all = await getExerciseVideos();
  delete all[exerciseName.toLowerCase()];
  await AsyncStorage.setItem("florish_exercise_videos", JSON.stringify(all));
}

// Custom workout videos (admin-uploaded)
export type CustomWorkoutVideo = {
  id: string;
  uri: string;
  title: string;
  duration?: number;
  thumbnail?: string;
  createdAt: string;
};

export async function getCustomWorkoutVideos(): Promise<CustomWorkoutVideo[]> {
  const raw = await AsyncStorage.getItem(KEYS.CUSTOM_VIDEOS);
  return raw ? JSON.parse(raw) : [];
}

export async function addCustomWorkoutVideo(
  data: Omit<CustomWorkoutVideo, "id" | "createdAt">
): Promise<CustomWorkoutVideo> {
  const all = await getCustomWorkoutVideos();
  const entry: CustomWorkoutVideo = {
    ...data,
    id: uid(),
    createdAt: new Date().toISOString(),
  };
  all.push(entry);
  await AsyncStorage.setItem(KEYS.CUSTOM_VIDEOS, JSON.stringify(all));
  return entry;
}

export async function deleteCustomWorkoutVideo(id: string): Promise<void> {
  const all = await getCustomWorkoutVideos();
  await AsyncStorage.setItem(
    KEYS.CUSTOM_VIDEOS,
    JSON.stringify(all.filter((v) => v.id !== id))
  );
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
