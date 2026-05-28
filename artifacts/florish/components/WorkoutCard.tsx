import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Workout } from "@/lib/workouts";

type Props = {
  workout: Workout;
  onPress: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  style?: object;
};

export function WorkoutCard({ workout, onPress, isFavorite, onFavoriteToggle, style }: Props) {
  const colors = useColors();

  const difficultyColor = {
    Beginner: colors.success,
    Intermediate: colors.accent,
    Advanced: colors.destructive,
  }[workout.difficulty];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}
    >
      <View style={[styles.colorBar, { backgroundColor: workout.thumbnailColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.tags}>
            <View style={[styles.tag, { backgroundColor: colors.muted }]}>
              <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{workout.category}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: difficultyColor + "22" }]}>
              <Text style={[styles.tagText, { color: difficultyColor }]}>{workout.difficulty}</Text>
            </View>
          </View>

          <Image
            source={workout.thumbnailImage}
            style={[styles.thumbnail, { borderColor: workout.thumbnailColor }]}
            resizeMode="cover"
          />

          {onFavoriteToggle && (
            <TouchableOpacity onPress={onFavoriteToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather
                name="heart"
                size={18}
                color={isFavorite ? colors.primary : colors.mutedForeground}
              />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {workout.title}
        </Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
          {workout.description}
        </Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Feather name="clock" size={12} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>{workout.durationMinutes} min</Text>
          </View>
          <View style={styles.stat}>
            <Feather name="zap" size={12} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>{workout.caloriesBurned} cal</Text>
          </View>
          <View style={styles.stat}>
            <Feather name="list" size={12} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>{workout.exercises.length} exercises</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
  },
  colorBar: {
    height: 4,
    width: "100%",
  },
  content: {
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tags: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
    flexWrap: "wrap",
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  thumbnail: {
    width: 110,
    height: 64,
    borderRadius: 10,
    borderWidth: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  stats: {
    flexDirection: "row",
    gap: 14,
    marginTop: 2,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
});
