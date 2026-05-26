import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
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
import { useColors } from "@/hooks/useColors";
import { useFitness } from "@/context/FitnessContext";
import { WorkoutCard } from "@/components/WorkoutCard";
import { WORKOUTS, WORKOUT_CATEGORIES, type WorkoutCategory } from "@/lib/workouts";

export default function WorkoutsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { favoriteWorkouts, toggleFavorite } = useFitness();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<WorkoutCategory | "All" | "Favorites">("All");

  const filtered = WORKOUTS.filter((w) => {
    const matchesSearch = search.length === 0 ||
      w.title.toLowerCase().includes(search.toLowerCase()) ||
      w.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" ||
      (activeCategory === "Favorites" && favoriteWorkouts.includes(w.id)) ||
      w.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Workouts</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {WORKOUTS.length} workouts · curated by Dillish
        </Text>

        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search workouts..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories} contentContainerStyle={{ gap: 8 }}>
          {(["All", "Favorites", ...WORKOUT_CATEGORIES] as const).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, { backgroundColor: isActive ? colors.primary : colors.muted, borderColor: isActive ? colors.primary : colors.border }]}
                onPress={() => setActiveCategory(cat as any)}
                activeOpacity={0.8}
              >
                {cat === "Favorites" && <Feather name="heart" size={12} color={isActive ? "#fff" : colors.mutedForeground} />}
                <Text style={[styles.catText, { color: isActive ? "#fff" : colors.mutedForeground }]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WorkoutCard
            workout={item}
            onPress={() => router.push(`/workout/${item.id}` as any)}
            isFavorite={favoriteWorkouts.includes(item.id)}
            onFavoriteToggle={() => toggleFavorite(item.id)}
            style={{ marginHorizontal: 20 }}
          />
        )}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: botPad + 100, gap: 0 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="activity" size={48} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No workouts found</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Try a different search or category</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, gap: 14 },
  title: { fontSize: 30, fontWeight: "800" as const, letterSpacing: -0.5 },
  subtitle: { fontSize: 14 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  categories: { marginHorizontal: -20, paddingHorizontal: 20 },
  catChip: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
    alignItems: "center",
  },
  catText: { fontSize: 13, fontWeight: "600" as const },
  empty: { padding: 60, alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" as const },
  emptyText: { fontSize: 14, textAlign: "center" },
});
