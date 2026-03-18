import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { History, TrendingUp, Heart, Music2 } from "lucide-react-native";
import { getTrending } from "../services/api";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useMusicStore } from "../store/musicStore";
import RecentlyPlayedSheet from "../components/RecentlyPlayedSheet";

const COLORS = {
  bg: "#000000",
  primary: "#FF4500",
  secondary: "#8A2BE2",
  cardBg: "#121212",
  textMain: "#FFFFFF",
  textSub: "#A0A0A0",
};

const TrackItem = memo(({ item, isSmall, onPress, onFav, checkFav }) => (
  <TouchableOpacity
    style={[styles.trackItem, isSmall && styles.smallTrackItem]}
    onPress={() => onPress(item)}
  >
    <Image
      source={{ uri: item.thumbnail }}
      style={isSmall ? styles.smallThumbnail : styles.thumbnail}
    />
    <View style={styles.trackInfo}>
      <Text
        style={[styles.trackTitle, isSmall && { fontSize: 13 }]}
        numberOfLines={1}
      >
        {item.title}
      </Text>
      <Text style={styles.trackArtist} numberOfLines={1}>
        {item.artist}
      </Text>
    </View>
    <TouchableOpacity onPress={() => onFav(item)} style={styles.favBtn}>
      <Heart
        size={isSmall ? 18 : 22}
        color={checkFav(item.id) ? COLORS.primary : "#333"}
        fill={checkFav(item.id) ? COLORS.primary : "transparent"}
      />
    </TouchableOpacity>
  </TouchableOpacity>
));

export default function HomeScreen({ navigation }) {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [serverWaking, setServerWaking] = useState(false);

  const { play } = useAudioPlayer();

  const recentlyPlayed = useMusicStore((s) => s.recentlyPlayed);
  const toggleFavorite = useMusicStore((s) => s.toggleFavorite);
  const isFavorite = useMusicStore((s) => s.isFavorite);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const wakeTimer = setTimeout(() => {
        setServerWaking(true);
      }, 3000);

      const data = await getTrending("TR");

      clearTimeout(wakeTimer);
      setServerWaking(false);
      setTrending(data.items || []);
    } catch (error) {
      console.error("Trending hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrendingPress = useCallback(
    (item) => {
      useMusicStore.getState().setQueue(trending);
      play(item);
      navigation.navigate("Player");
    },
    [play, navigation, trending],
  );

  const handleRecentPress = useCallback(
    (item) => {
      useMusicStore.getState().setQueue(recentlyPlayed);
      play(item);
      navigation.navigate("Player");
    },
    [play, navigation, recentlyPlayed],
  );

  const renderTrendItem = useCallback(
    ({ item }) => (
      <View style={{ paddingHorizontal: 20 }}>
        <TrackItem
          item={item}
          onPress={handleTrendingPress}
          onFav={toggleFavorite}
          checkFav={isFavorite}
        />
      </View>
    ),
    [handleTrendingPress, toggleFavorite, isFavorite],
  );

  const ListHeader = useMemo(
    () => (
      <View>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Keşfet</Text>
          <View style={styles.profileCircle}>
            <Music2 color={COLORS.primary} size={20} />
          </View>
        </View>

        {recentlyPlayed?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <History color={COLORS.secondary} size={18} />
                <Text style={styles.sectionTitle}>Son Dinlediklerin</Text>
              </View>
              <TouchableOpacity onPress={() => setSheetVisible(true)}>
                <Text style={{ color: COLORS.primary, fontWeight: "bold" }}>
                  Hepsini Gör
                </Text>
              </TouchableOpacity>
            </View>
            {recentlyPlayed.slice(0, 5).map((item) => (
              <TrackItem
                key={`recent-${item.id}`}
                item={item}
                isSmall={true}
                onPress={handleRecentPress}
                onFav={toggleFavorite}
                checkFav={isFavorite}
              />
            ))}
          </View>
        )}

        <View style={[styles.section, { marginBottom: 10 }]}>
          <View style={styles.sectionHeader}>
            <TrendingUp color={COLORS.primary} size={20} />
            <Text style={styles.sectionTitle}>Türkiye Trendleri</Text>
          </View>
        </View>
      </View>
    ),
    [recentlyPlayed, handleRecentPress, toggleFavorite, isFavorite],
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        {serverWaking && (
          <View style={styles.wakeNotice}>
            <Text style={styles.wakeTitle}>Sunucu uyanıyor</Text>
            <Text style={styles.wakeSubtitle}>
              İlk açılış biraz uzun sürebilir, lütfen bekle...
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trending}
        keyExtractor={(item) => `trend-${item.id}`}
        renderItem={renderTrendItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 100 }}
        removeClippedSubviews={true}
        windowSize={5}
        maxToRenderPerBatch={8}
        initialNumToRender={10}
        getItemLayout={(_, index) => ({
          length: 84,
          offset: 84 * index,
          index,
        })}
      />
      <RecentlyPlayedSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    gap: 20,
  },
  wakeNotice: {
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 8,
  },
  wakeTitle: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: "700",
  },
  wakeSubtitle: {
    color: COLORS.textSub,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.textMain,
    letterSpacing: -1,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    padding: 12,
    borderRadius: 15,
    marginBottom: 12,
  },
  smallTrackItem: {
    padding: 8,
    backgroundColor: "transparent",
    borderBottomWidth: 0.5,
    borderBottomColor: "#1A1A1A",
    borderRadius: 0,
    marginBottom: 5,
  },
  thumbnail: { width: 60, height: 60, borderRadius: 10 },
  smallThumbnail: { width: 45, height: 45, borderRadius: 8 },
  trackInfo: { flex: 1, marginLeft: 15 },
  trackTitle: { color: COLORS.textMain, fontSize: 15, fontWeight: "600" },
  trackArtist: { color: COLORS.textSub, fontSize: 13, marginTop: 2 },
  favBtn: { padding: 5 },
});
