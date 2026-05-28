import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import React, { useState, useEffect } from "react";
import {
  Alert,
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
import { useAuth } from "@/context/AuthContext";
import { WorkoutCard } from "@/components/WorkoutCard";
import { WORKOUTS, WORKOUT_CATEGORIES, type WorkoutCategory } from "@/lib/workouts";
import { getCustomWorkoutVideos, addCustomWorkoutVideo, deleteCustomWorkoutVideo, type CustomWorkoutVideo } from "@/lib/storage";

export default function WorkoutsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { favoriteWorkouts, toggleFavorite } = useFitness();
  const { isAdmin } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<WorkoutCategory | "All" | "Favorites" | "My Videos">("All");
  const [customVideos, setCustomVideos] = useState<CustomWorkoutVideo[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCustomVideos();
  }, []);

  const loadCustomVideos = async () => {
    const videos = await getCustomWorkoutVideos();
    setCustomVideos(videos);
  };

  const copyToPermanent = async (uri: string): Promise<string> => {
    if (!FileSystem.documentDirectory) return uri;
    const dir = `${FileSystem.documentDirectory}florish_videos/`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const ext = uri.split("?")[0]?.split(".").pop() ?? "mp4";
    const dest = `${dir}${Date.now()}.${ext}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  };

  const handleUploadVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your media library to upload workout videos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: false,
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;
    setUploading(true);
    try {
      const asset = result.assets[0];
      const permanentUri = await copyToPermanent(asset.uri);
      const title = await promptTitle();
      const video = await addCustomWorkoutVideo({
        uri: permanentUri,
        title: title || "My Workout",
        duration: asset.duration ? Math.round(asset.duration / 60) : undefined,
        thumbnail: permanentUri,
      });
      setCustomVideos((prev) => [...prev, video]);
      setActiveCategory("My Videos");
    } finally {
      setUploading(false);
    }
  };

  const promptTitle = (): Promise<string> => {
    return new Promise((resolve) => {
      if (Platform.OS === "web") {
        const title = window.prompt("Name this workout video:", "My Workout");
        resolve(title || "My Workout");
      } else {
        Alert.prompt(
          "Name this workout",
          "Give your video a title",
          (text) => resolve(text || "My Workout"),
          "plain-text",
          "My Workout"
        );
      }
    });
  };

  const handleDeleteVideo = (id: string) => {
    Alert.alert("Delete Video", "Remove this workout video?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCustomWorkoutVideo(id);
          setCustomVideos((prev) => prev.filter((v) => v.id !== id));
        },
      },
    ]);
  };

  const filtered = WORKOUTS.filter((w) => {
    const matchesSearch =
      search.length === 0 ||
      w.title.toLowerCase().includes(search.toLowerCase()) ||
      w.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" ||
      activeCategory === "My Videos" ||
      (activeCategory === "Favorites" && favoriteWorkouts.includes(w.id)) ||
      w.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const showingVideos = activeCategory === "My Videos";

  const categories = ["All", "Favorites", ...WORKOUT_CATEGORIES, "My Videos"] as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Workouts</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {WORKOUTS.length} workouts · curated by Dillish
            </Text>
          </View>
          {isAdmin && (
            <TouchableOpacity
              style={[styles.uploadBtn, { backgroundColor: colors.primary }]}
              onPress={handleUploadVideo}
              disabled={uploading}
              activeOpacity={0.8}
            >
              <Feather name={uploading ? "loader" : "upload"} size={14} color="#fff" />
              <Text style={styles.uploadBtnText}>{uploading ? "Uploading…" : "Upload"}</Text>
            </TouchableOpacity>
          )}
        </View>

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
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, { backgroundColor: isActive ? colors.primary : colors.muted, borderColor: isActive ? colors.primary : colors.border }]}
                onPress={() => setActiveCategory(cat as any)}
                activeOpacity={0.8}
              >
                {cat === "Favorites" && <Feather name="heart" size={12} color={isActive ? "#fff" : colors.mutedForeground} />}
                {cat === "My Videos" && <Feather name="video" size={12} color={isActive ? "#fff" : colors.mutedForeground} />}
                <Text style={[styles.catText, { color: isActive ? "#fff" : colors.mutedForeground }]}>{cat}</Text>
                {cat === "My Videos" && customVideos.length > 0 && (
                  <View style={[styles.badge, { backgroundColor: isActive ? "rgba(255,255,255,0.3)" : colors.primary }]}>
                    <Text style={[styles.badgeText, { color: "#fff" }]}>{customVideos.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {showingVideos ? (
        <FlatList
          data={customVideos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VideoCard video={item} colors={colors} onDelete={() => handleDeleteVideo(item.id)} isAdmin={isAdmin} />
          )}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: botPad + 100, gap: 12, paddingHorizontal: 20 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="video" size={48} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No videos yet</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {isAdmin ? "Tap Upload to add your first workout video" : "Dillish hasn't uploaded any videos yet"}
              </Text>
              {isAdmin && (
                <TouchableOpacity
                  style={[styles.emptyUploadBtn, { backgroundColor: colors.primary }]}
                  onPress={handleUploadVideo}
                  activeOpacity={0.8}
                >
                  <Feather name="upload" size={16} color="#fff" />
                  <Text style={styles.emptyUploadText}>Upload Video</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
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
      )}
    </View>
  );
}

function VideoCard({
  video,
  colors,
  onDelete,
  isAdmin,
}: {
  video: CustomWorkoutVideo;
  colors: ReturnType<typeof useColors>;
  onDelete: () => void;
  isAdmin: boolean;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <View style={[videoStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={[videoStyles.playArea, { backgroundColor: colors.muted }]}
        onPress={() => setPlaying((p) => !p)}
        activeOpacity={0.9}
      >
        {playing ? (
          <VideoPlayer uri={video.uri} />
        ) : (
          <View style={videoStyles.playIcon}>
            <Feather name="play-circle" size={48} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>
      <View style={videoStyles.info}>
        <View style={videoStyles.infoRow}>
          <Text style={[videoStyles.title, { color: colors.foreground }]} numberOfLines={1}>
            {video.title}
          </Text>
          {isAdmin && (
            <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="trash-2" size={16} color={colors.destructive} />
            </TouchableOpacity>
          )}
        </View>
        <View style={videoStyles.meta}>
          <Feather name="video" size={12} color={colors.mutedForeground} />
          <Text style={[videoStyles.metaText, { color: colors.mutedForeground }]}>
            {video.duration ? `${video.duration} min` : "Workout video"} · {new Date(video.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

function VideoPlayer({ uri }: { uri: string }) {
  const [VideoComponent, setVideoComponent] = useState<any>(null);

  useEffect(() => {
    import("expo-av").then(({ Video, ResizeMode }) => {
      setVideoComponent({ Video, ResizeMode });
    });
  }, []);

  if (!VideoComponent) return <View style={videoStyles.playIcon}><Feather name="loader" size={32} color="#aaa" /></View>;

  const { Video, ResizeMode } = VideoComponent;
  return (
    <Video
      source={{ uri }}
      style={{ width: "100%", height: 200 }}
      useNativeControls
      resizeMode={ResizeMode.CONTAIN}
      shouldPlay
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, gap: 14 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontSize: 30, fontWeight: "800" as const, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 2 },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  uploadBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" as const },
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
  badge: { borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 2 },
  badgeText: { fontSize: 10, fontWeight: "700" as const },
  empty: { padding: 60, alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" as const },
  emptyText: { fontSize: 14, textAlign: "center" },
  emptyUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyUploadText: { color: "#fff", fontSize: 15, fontWeight: "700" as const },
});

const videoStyles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  playArea: { height: 200, justifyContent: "center", alignItems: "center" },
  playIcon: { justifyContent: "center", alignItems: "center", height: 200 },
  info: { padding: 14, gap: 6 },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "700" as const, flex: 1, marginRight: 8 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13 },
});
