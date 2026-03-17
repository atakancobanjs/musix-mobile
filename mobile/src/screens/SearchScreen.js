import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Image,
} from "react-native";
import { Search, X, History, Heart, Music2, Clock } from "lucide-react-native";
import { searchMusic } from "../services/api";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useMusicStore } from "../store/musicStore";
import { formatDuration } from "../utils/format";
import TrackOptionsSheet from "../components/TrackOptionSheet";

const COLORS = {
  bg: "#000000",
  primary: "#FF4500",
  secondary: "#8A2BE2",
  cardBg: "#121212",
  textMain: "#FFFFFF",
  textSub: "#A0A0A0",
  inputBg: "#1A1A1A",
};

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const { play } = useAudioPlayer();

  const {
    currentTrack,
    searchHistory = [], // Varsayılan değer atayarak 'length' hatasını önlüyoruz
    addSearchHistory,
    clearSearchHistory,
    toggleFavorite,
    isFavorite,
    addToRecentlyPlayed,
  } = useMusicStore();

  const handleLongPress = (track) => {
    setSelectedTrack(track);
    setSheetVisible(true);
  };

  const handleTrackPress = async (item) => {
    if (!item || loadingTrackId === item.id) return;

    try {
      setLoadingTrackId(item.id);

      // 1. Şarkıyı "Son Dinlenenler"e ekle
      if (addToRecentlyPlayed) {
        addToRecentlyPlayed(item);
      }

      // 2. Şarkıyı çal ve Player'a git
      await play(item);
      setLoadingTrackId(null);
      navigation.navigate("Player");
    } catch (error) {
      console.error("Şarkı açma hatası:", error);
      setLoadingTrackId(null);
    }
  };

  const doSearch = async (q, pageToken = null) => {
    if (!q || !q.trim()) return;
    Keyboard.dismiss();

    if (!pageToken) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await searchMusic(q, 20, pageToken);
      if (pageToken) {
        setResults((prev) => [...prev, ...(data?.items || [])]);
      } else {
        setResults(data?.items || []);
        if (addSearchHistory) addSearchHistory(q);
      }
      setNextPageToken(data?.nextPageToken);
    } catch (e) {
      console.error("Arama hatası:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const renderItem = useCallback(
    ({ item }) => {
      if (!item) return null;
      const isCurrentPlaying = currentTrack?.id === item.id;
      const isThisLoading = loadingTrackId === item.id && !isCurrentPlaying;

      return (
        <TouchableOpacity
          style={[styles.trackItem, isCurrentPlaying && styles.activeTrackItem]}
          onPress={() => {
            handleTrackPress(item);
            navigation.navigate("Player");
          }}
          onLongPress={() => handleLongPress(item)}
          delayLongPress={300}
        >
          <View style={{ position: "relative" }}>
            <Image
              source={{
                uri: item?.thumbnail || "https://via.placeholder.com/150",
              }}
              style={[
                styles.thumbnail,
                (isCurrentPlaying || isThisLoading) && { opacity: 0.6 },
              ]}
            />
            {isThisLoading && (
              <View style={styles.inlineLoader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
            {isCurrentPlaying && (
              <View style={styles.playingOverlay}>
                <Music2
                  size={18}
                  color={COLORS.primary}
                  fill={COLORS.primary}
                />
              </View>
            )}
          </View>

          <View style={styles.trackInfo}>
            <Text
              style={[
                styles.trackTitle,
                isCurrentPlaying && { color: COLORS.primary },
              ]}
              numberOfLines={1}
            >
              {item?.title || "Bilinmeyen Başlık"}
            </Text>
            <Text style={styles.trackArtist} numberOfLines={1}>
              {item?.artist || "Bilinmeyen Sanatçı"}
            </Text>
            <View style={styles.durationRow}>
              <Clock size={10} color={COLORS.textSub} />
              <Text style={styles.trackDuration}>
                {/* Duration okumasını güvenli hale getirdik */}
                {item?.duration ? formatDuration(item.duration) : "00:00"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => toggleFavorite(item)}
            style={styles.favBtn}
          >
            <Heart
              size={20}
              color={isFavorite(item?.id) ? COLORS.primary : COLORS.textSub}
              fill={isFavorite(item?.id) ? COLORS.primary : "transparent"}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [results, toggleFavorite, isFavorite, loadingTrackId, currentTrack],
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Search
            color={COLORS.textSub}
            size={20}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={styles.input}
            placeholder="Şarkı, sanatçı ara..."
            placeholderTextColor="#666"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => doSearch(query)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setResults([]);
              }}
            >
              <X color={COLORS.textSub} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {results.length === 0 &&
      !loading &&
      searchHistory &&
      searchHistory.length > 0 ? (
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <History color={COLORS.secondary} size={18} />
              <Text style={styles.sectionTitle}>Son Aramalar</Text>
            </View>
            <TouchableOpacity onPress={clearSearchHistory}>
              <Text style={styles.clearText}>Temizle</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={searchHistory.slice(0, 6)}
            keyExtractor={(item, index) => `history-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.historyItem}
                onPress={() => {
                  setQuery(item);
                  doSearch(item);
                }}
              >
                <Clock color="#444" size={16} />
                <Text style={styles.historyText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, i) => `${item?.id || i}_${i}`}
          contentContainerStyle={{ paddingBottom: 100 }}
          onEndReached={() => {
            if (nextPageToken && !loadingMore) doSearch(query, nextPageToken);
          }}
          onEndReachedThreshold={0.5}
          renderItem={renderItem}
          removeClippedSubviews={true}
          initialNumToRender={10}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                color={COLORS.primary}
                style={{ margin: 20 }}
              />
            ) : null
          }
          ListEmptyComponent={() =>
            !loading &&
            query.length > 0 && (
              <Text
                style={{
                  color: COLORS.textSub,
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                Sonuç bulunamadı.
              </Text>
            )
          }
        />
      )}

      <TrackOptionsSheet
        visible={sheetVisible}
        track={selectedTrack}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  searchHeader: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.bg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  input: { flex: 1, color: COLORS.textMain, fontSize: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  historySection: { paddingHorizontal: 20, marginTop: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  clearText: { color: COLORS.secondary, fontWeight: "600", fontSize: 13 },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#111",
  },
  historyText: { color: COLORS.textSub, marginLeft: 15, fontSize: 15 },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 10,
    marginBottom: 8,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeTrackItem: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(255, 69, 0, 0.08)",
  },
  thumbnail: { width: 55, height: 55, borderRadius: 8 },
  inlineLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 8,
  },
  playingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 8,
  },
  trackInfo: { flex: 1, marginLeft: 15 },
  trackTitle: { color: COLORS.textMain, fontSize: 14, fontWeight: "700" },
  trackArtist: { color: COLORS.textSub, fontSize: 12, marginTop: 3 },
  durationRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  trackDuration: { color: COLORS.textSub, fontSize: 10, marginLeft: 4 },
  favBtn: { padding: 5 },
});
