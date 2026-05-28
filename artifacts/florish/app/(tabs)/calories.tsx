import React, { useState } from "react";
import {
  Alert,
  FlatList,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useFitness } from "@/context/FitnessContext";
import { searchFoods, estimateFromDescription, type FoodItem } from "@/lib/foodDatabase";
import type { MealEntry } from "@/lib/storage";

type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

const MEAL_SECTIONS: { key: MealType; label: string; icon: string; color: string }[] = [
  { key: "breakfast", label: "Breakfast", icon: "sunrise", color: "#F4A261" },
  { key: "lunch", label: "Lunch", icon: "sun", color: "#E76F51" },
  { key: "dinner", label: "Dinner", icon: "moon", color: "#457B9D" },
  { key: "snacks", label: "Snacks", icon: "coffee", color: "#6D6875" },
];

function MacroBar({ label, value, max, color, colors }: { label: string; value: number; max: number; color: string; colors: any }) {
  const pct = Math.min(value / max, 1);
  return (
    <View style={macroStyles.wrap}>
      <View style={macroStyles.header}>
        <Text style={[macroStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[macroStyles.value, { color: colors.foreground }]}>{value}g</Text>
      </View>
      <View style={[macroStyles.bar, { backgroundColor: colors.muted }]}>
        <View style={[macroStyles.fill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const macroStyles = StyleSheet.create({
  wrap: { gap: 4 },
  header: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 12, fontWeight: "600" as const },
  value: { fontSize: 12, fontWeight: "700" as const },
  bar: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
});

export default function CaloriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { todayMeals, todayCalories, addMeal, removeMeal } = useFitness();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [addModal, setAddModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [customCalories, setCustomCalories] = useState("");
  const [customName, setCustomName] = useState("");

  const calorieGoal = user?.dailyCalorieGoal ?? 1800;
  const remaining = Math.max(calorieGoal - todayCalories, 0);
  const pct = Math.min(todayCalories / calorieGoal, 1);

  const protein = todayMeals.reduce((s, m) => s + m.protein, 0);
  const carbs = todayMeals.reduce((s, m) => s + m.carbs, 0);
  const fat = todayMeals.reduce((s, m) => s + m.fat, 0);

  const getMealsForType = (type: MealType) => todayMeals.filter((m) => m.mealType === type);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 1) {
      setResults(searchFoods(text));
    } else {
      setResults([]);
    }
    setSelectedFood(null);
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setResults([]);
    setQuery(food.name);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      const estimate = estimateFromDescription(query || "food");
      if (estimate) {
        setSelectedFood(estimate);
        setQuery(estimate.name);
      }
    }
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera access is required to scan food.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      const estimate = estimateFromDescription(query || "food");
      if (estimate) {
        setSelectedFood(estimate);
        setQuery(estimate.name);
      } else {
        setSelectedFood({ name: "Scanned Food", calories: 300, protein: 15, carbs: 35, fat: 8, servingSize: "1 serving" });
        setQuery("Scanned Food");
      }
    }
  };

  const handleAddMeal = async () => {
    const food = selectedFood ?? (customCalories ? {
      name: customName || "Custom Food",
      calories: parseInt(customCalories) || 0,
      protein: 0, carbs: 0, fat: 0,
      servingSize: "1 serving",
    } : null);
    if (!food) return;
    await addMeal({
      name: food.name,
      mealType: selectedMealType,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      imageUri: imageUri ?? undefined,
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAddModal(false);
    setQuery("");
    setResults([]);
    setSelectedFood(null);
    setImageUri(null);
    setCustomCalories("");
    setCustomName("");
  };

  const handleDelete = async (id: string) => {
    await removeMeal(id);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: botPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Calorie Tracker</Text>

        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.calorieRow}>
            <View style={styles.calorieMain}>
              <Text style={[styles.calorieNum, { color: colors.foreground }]}>{todayCalories}</Text>
              <Text style={[styles.calorieLabel, { color: colors.mutedForeground }]}>consumed</Text>
            </View>
            <View style={styles.calorieDivider} />
            <View style={styles.calorieSide}>
              <Text style={[styles.calorieSideNum, { color: colors.success }]}>{remaining}</Text>
              <Text style={[styles.calorieLabel, { color: colors.mutedForeground }]}>remaining</Text>
            </View>
            <View style={styles.calorieDivider} />
            <View style={styles.calorieSide}>
              <Text style={[styles.calorieSideNum, { color: colors.primary }]}>{calorieGoal}</Text>
              <Text style={[styles.calorieLabel, { color: colors.mutedForeground }]}>goal</Text>
            </View>
          </View>

          <View style={[styles.progressOuter, { backgroundColor: colors.muted }]}>
            <View style={[styles.progressFill, { width: `${pct * 100}%` as any, backgroundColor: todayCalories > calorieGoal ? colors.destructive : colors.primary }]} />
          </View>

          <View style={styles.macros}>
            <MacroBar label="Protein" value={protein} max={150} color="#E8A0B4" colors={colors} />
            <MacroBar label="Carbs" value={carbs} max={200} color="#3BBDB5" colors={colors} />
            <MacroBar label="Fat" value={fat} max={65} color="#A8C4E0" colors={colors} />
          </View>
        </View>

        {MEAL_SECTIONS.map((section) => {
          const meals = getMealsForType(section.key);
          const sectionCals = meals.reduce((s, m) => s + m.calories, 0);
          return (
            <View key={section.key}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLeft}>
                  <View style={[styles.sectionIcon, { backgroundColor: section.color + "22" }]}>
                    <Feather name={section.icon as any} size={16} color={section.color} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.label}</Text>
                </View>
                <Text style={[styles.sectionCals, { color: colors.mutedForeground }]}>{sectionCals} cal</Text>
              </View>

              {meals.map((meal) => (
                <View key={meal.id} style={[styles.mealRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {meal.imageUri && <Image source={{ uri: meal.imageUri }} style={styles.mealImg} contentFit="cover" />}
                  <View style={styles.mealInfo}>
                    <Text style={[styles.mealName, { color: colors.foreground }]}>{meal.name}</Text>
                    <Text style={[styles.mealMacros, { color: colors.mutedForeground }]}>
                      P: {meal.protein}g · C: {meal.carbs}g · F: {meal.fat}g
                    </Text>
                  </View>
                  <Text style={[styles.mealCals, { color: colors.primary }]}>{meal.calories}</Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(meal.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather name="trash-2" size={16} color={colors.destructive} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.addFoodBtn, { borderColor: colors.border }]}
                onPress={() => { setSelectedMealType(section.key); setAddModal(true); }}
                activeOpacity={0.7}
              >
                <Feather name="plus" size={16} color={colors.mutedForeground} />
                <Text style={[styles.addFoodText, { color: colors.mutedForeground }]}>Add food</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={addModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setAddModal(false)}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Add to {MEAL_SECTIONS.find((s) => s.key === selectedMealType)?.label}
            </Text>
            <TouchableOpacity onPress={handleAddMeal} disabled={!selectedFood && !customCalories}>
              <Text style={[styles.modalSave, { color: selectedFood || customCalories ? colors.primary : colors.border }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.cameraRow}>
              <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: colors.muted, borderColor: colors.border }]} onPress={handleCamera}>
                <Feather name="camera" size={20} color={colors.foreground} />
                <Text style={[styles.cameraBtnText, { color: colors.foreground }]}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: colors.muted, borderColor: colors.border }]} onPress={handlePickImage}>
                <Feather name="image" size={20} color={colors.foreground} />
                <Text style={[styles.cameraBtnText, { color: colors.foreground }]}>Gallery</Text>
              </TouchableOpacity>
            </View>

            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.previewImg} contentFit="cover" />
            )}

            <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="search" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder="Search food or describe what you ate..."
                placeholderTextColor={colors.mutedForeground}
                value={query}
                onChangeText={handleSearch}
              />
            </View>

            {results.map((r) => (
              <TouchableOpacity
                key={r.name}
                style={[styles.resultRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleSelectFood(r)}
              >
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: colors.foreground }]}>{r.name}</Text>
                  <Text style={[styles.resultMacros, { color: colors.mutedForeground }]}>
                    P: {r.protein}g · C: {r.carbs}g · F: {r.fat}g · {r.servingSize}
                  </Text>
                </View>
                <Text style={[styles.resultCals, { color: colors.primary }]}>{r.calories}</Text>
              </TouchableOpacity>
            ))}

            {selectedFood && (
              <View style={[styles.selectedCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
                <Feather name="check-circle" size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.selectedName, { color: colors.foreground }]}>{selectedFood.name}</Text>
                  <Text style={[styles.selectedMacros, { color: colors.mutedForeground }]}>
                    {selectedFood.calories} cal · P: {selectedFood.protein}g · C: {selectedFood.carbs}g · F: {selectedFood.fat}g
                  </Text>
                </View>
              </View>
            )}

            {!selectedFood && query.length > 2 && results.length === 0 && (
              <View style={styles.customSection}>
                <Text style={[styles.customLabel, { color: colors.mutedForeground }]}>
                  Not found? Add manually:
                </Text>
                <TextInput
                  style={[styles.customInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="Food name"
                  placeholderTextColor={colors.mutedForeground}
                  value={customName}
                  onChangeText={setCustomName}
                />
                <TextInput
                  style={[styles.customInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="Calories"
                  placeholderTextColor={colors.mutedForeground}
                  value={customCalories}
                  onChangeText={setCustomCalories}
                  keyboardType="numeric"
                />
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 18 },
  title: { fontSize: 30, fontWeight: "800" as const, letterSpacing: -0.5 },
  summaryCard: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 14 },
  calorieRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  calorieMain: { alignItems: "center" },
  calorieNum: { fontSize: 36, fontWeight: "800" as const, letterSpacing: -1 },
  calorieLabel: { fontSize: 12 },
  calorieDivider: { width: 1, height: 40, backgroundColor: "#eee" },
  calorieSide: { alignItems: "center" },
  calorieSideNum: { fontSize: 22, fontWeight: "800" as const },
  progressOuter: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  macros: { gap: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  sectionLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  sectionTitle: { fontSize: 17, fontWeight: "700" as const },
  sectionCals: { fontSize: 14, fontWeight: "600" as const },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
    gap: 10,
  },
  mealImg: { width: 40, height: 40, borderRadius: 8 },
  mealInfo: { flex: 1, gap: 2 },
  mealName: { fontSize: 14, fontWeight: "600" as const },
  mealMacros: { fontSize: 11 },
  mealCals: { fontSize: 16, fontWeight: "800" as const },
  addFoodBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: "dashed" as const,
    gap: 8,
    marginBottom: 8,
  },
  addFoodText: { fontSize: 14 },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontWeight: "700" as const },
  modalSave: { fontSize: 16, fontWeight: "700" as const },
  modalContent: { padding: 20, gap: 14 },
  cameraRow: { flexDirection: "row", gap: 12 },
  cameraBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  cameraBtnText: { fontSize: 14, fontWeight: "600" as const },
  previewImg: { width: "100%" as any, height: 150, borderRadius: 12 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: "600" as const },
  resultMacros: { fontSize: 11, marginTop: 2 },
  resultCals: { fontSize: 18, fontWeight: "800" as const },
  selectedCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  selectedName: { fontSize: 15, fontWeight: "700" as const },
  selectedMacros: { fontSize: 12, marginTop: 2 },
  customSection: { gap: 10 },
  customLabel: { fontSize: 13 },
  customInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
  },
});
