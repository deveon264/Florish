import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  MealEntry,
  WaterEntry,
  WorkoutHistoryEntry,
  WeightEntry,
  ProgressPhoto,
  getTodayMeals,
  getTodayWaterEntries,
  getWorkoutHistory,
  getFavoriteWorkouts,
  getWeightLog,
  getProgressPhotos,
  getStreak,
  addMealEntry,
  deleteMealEntry,
  addWaterEntry,
  logWorkoutCompletion,
  toggleFavoriteWorkout,
  addWeightEntry,
  addProgressPhoto,
  updateStreak,
} from "@/lib/storage";

type FitnessState = {
  todayMeals: MealEntry[];
  todayWater: WaterEntry[];
  workoutHistory: WorkoutHistoryEntry[];
  favoriteWorkouts: string[];
  weightLog: WeightEntry[];
  progressPhotos: ProgressPhoto[];
  streak: number;
  todayCalories: number;
  todayWaterMl: number;

  addMeal: (meal: Omit<MealEntry, "id" | "timestamp" | "date">) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  logWater: (amountMl: number) => Promise<void>;
  completeWorkout: (workoutId: string, durationMinutes: number) => Promise<void>;
  toggleFavorite: (workoutId: string) => Promise<boolean>;
  logWeight: (weightKg: number) => Promise<void>;
  addPhoto: (uri: string, note?: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const FitnessContext = createContext<FitnessState | null>(null);

export function FitnessProvider({ children }: { children: React.ReactNode }) {
  const [todayMeals, setTodayMeals] = useState<MealEntry[]>([]);
  const [todayWater, setTodayWater] = useState<WaterEntry[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [favoriteWorkouts, setFavoriteWorkouts] = useState<string[]>([]);
  const [weightLog, setWeightLog] = useState<WeightEntry[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [streak, setStreak] = useState(0);

  const load = useCallback(async () => {
    const [meals, water, history, favs, weights, photos, str] = await Promise.all([
      getTodayMeals(),
      getTodayWaterEntries(),
      getWorkoutHistory(),
      getFavoriteWorkouts(),
      getWeightLog(),
      getProgressPhotos(),
      getStreak(),
    ]);
    setTodayMeals(meals);
    setTodayWater(water);
    setWorkoutHistory(history);
    setFavoriteWorkouts(favs);
    setWeightLog(weights);
    setProgressPhotos(photos);
    setStreak(str);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addMeal = async (meal: Omit<MealEntry, "id" | "timestamp" | "date">) => {
    await addMealEntry(meal);
    setTodayMeals(await getTodayMeals());
  };

  const removeMeal = async (id: string) => {
    await deleteMealEntry(id);
    setTodayMeals(await getTodayMeals());
  };

  const logWater = async (amountMl: number) => {
    await addWaterEntry(amountMl);
    setTodayWater(await getTodayWaterEntries());
  };

  const completeWorkout = async (workoutId: string, durationMinutes: number) => {
    await logWorkoutCompletion(workoutId, durationMinutes);
    const [history, newStreak] = await Promise.all([getWorkoutHistory(), updateStreak()]);
    setWorkoutHistory(history);
    setStreak(newStreak);
  };

  const toggleFavorite = async (workoutId: string) => {
    const isFav = await toggleFavoriteWorkout(workoutId);
    setFavoriteWorkouts(await getFavoriteWorkouts());
    return isFav;
  };

  const logWeight = async (weightKg: number) => {
    await addWeightEntry(weightKg);
    setWeightLog(await getWeightLog());
  };

  const addPhoto = async (uri: string, note?: string) => {
    await addProgressPhoto(uri, note);
    setProgressPhotos(await getProgressPhotos());
  };

  const todayCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const todayWaterMl = todayWater.reduce((sum, w) => sum + w.amountMl, 0);

  return (
    <FitnessContext.Provider
      value={{
        todayMeals,
        todayWater,
        workoutHistory,
        favoriteWorkouts,
        weightLog,
        progressPhotos,
        streak,
        todayCalories,
        todayWaterMl,
        addMeal,
        removeMeal,
        logWater,
        completeWorkout,
        toggleFavorite,
        logWeight,
        addPhoto,
        refresh: load,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
}

export function useFitness() {
  const ctx = useContext(FitnessContext);
  if (!ctx) throw new Error("useFitness must be used within FitnessProvider");
  return ctx;
}
