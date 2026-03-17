// screens/PlayerScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";
import Slider from "@react-native-community/slider";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ListPlus,
  ListMusic,
  X,
  GripVertical,
  Trash2,
} from "lucide-react-native";
import { useMusicStore } from "../store/musicStore";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { formatDuration } from "../utils/format";

const { width, height } = Dimensions.get("window");

const COLORS = {
  bg: "#0E0C0B",
  cardBg: "rgba(255, 80, 20, 0.07)",
  primary: "#FF4500",
  secondary: "#8A2BE2",
  drawerBg: "#161616",
  textMain: "#FFFFFF",
  textSub: "#A0A0A0",
  textDisabled: "rgba(255,255,255,0.3)",
};

export default function PlayerScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [queueVisible, setQueueVisible] = useState(false);

  const [progress, setProgress] = useState({ position: 0, duration: null });

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const currentTrack = useMusicStore((s) => s.currentTrack);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const playlists = useMusicStore((s) => s.playlists);
  const queue = useMusicStore((s) => s.queue);
  const setQueue = useMusicStore((s) => s.setQueue);
  const toggleFavorite = useMusicStore((s) => s.toggleFavorite);
  const isFavorite = useMusicStore((s) => s.isFavorite);
  const addToPlaylist = useMusicStore((s) => s.addToPlaylist);
  const getNextTrack = useMusicStore((s) => s.getNextTrack);
  const getPrevTrack = useMusicStore((s) => s.getPrevTrack);

  const { play, handleToggle, handleSeek, playNext, playPrev } =
    useAudioPlayer(setProgress);

  // ✅ Şarkı değişince progress'i sıfırla — duration null ile başlar
  useEffect(() => {
    setProgress({ position: 0, duration: null });
  }, [currentTrack?.id]);

  useEffect(() => {
    if (!currentTrack && navigation.canGoBack()) navigation.goBack();
  }, [currentTrack]);

  const handlePlaylistToggle = useCallback(
    (playlistId) => {
      const targetPlaylist = playlists.find((p) => p.id === playlistId);
      const isAlreadyIn = targetPlaylist?.items?.some(
        (t) => t.id === currentTrack?.id,
      );
      if (isAlreadyIn) {
        useMusicStore
          .getState()
          .removeFromPlaylist(playlistId, currentTrack.id);
      } else {
        addToPlaylist(playlistId, currentTrack);
      }
    },
    [playlists, currentTrack, addToPlaylist],
  );

  const handleDragEnd = useCallback(({ data }) => setQueue(data), [setQueue]);

  const handleRemoveFromQueue = useCallback(
    (trackId) => setQueue(queue.filter((t) => t.id !== trackId)),
    [queue, setQueue],
  );

  const handlePlayFromQueue = useCallback(
    (track) => {
      play(track);
      setQueueVisible(false);
    },
    [play],
  );

  if (!currentTrack) return null;

  const hasQueue = queue && queue.length > 1;
  const nextTrackExists = hasQueue && !!getNextTrack();
  const prevTrackExists = hasQueue && !!getPrevTrack();
  const queueButtonDisabled = !queue || queue.length <= 1;

  // ✅ duration null veya 0 ise henüz yüklenmedi — spinner göster
  const isLoaded = progress.duration !== null && progress.duration > 0;

  const renderQueueSheet = () => (
    <Modal
      visible={queueVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setQueueVisible(false)}
    >
      <View style={styles.sheetOverlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Sıradaki Şarkılar</Text>
              <Text style={styles.sheetSubtitle}>{queue.length} şarkı</Text>
            </View>
            <TouchableOpacity onPress={() => setQueueVisible(false)}>
              <X color="#FFF" size={26} />
            </TouchableOpacity>
          </View>

          <GestureHandlerRootView style={{ flex: 1 }}>
            <DraggableFlatList
              data={queue}
              keyExtractor={(item) => item.id}
              onDragEnd={handleDragEnd}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item, drag, isActive }) => {
                const isCurrent = item.id === currentTrack?.id;
                return (
                  <ScaleDecorator>
                    <View
                      style={[
                        styles.queueItem,
                        isActive && styles.queueItemActive,
                        isCurrent && styles.queueItemCurrent,
                      ]}
                    >
                      <TouchableOpacity
                        onLongPress={drag}
                        style={styles.dragHandle}
                      >
                        <GripVertical size={20} color={COLORS.textSub} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.queueItemInfo}
                        onPress={() => handlePlayFromQueue(item)}
                      >
                        <Image
                          source={{ uri: item.thumbnail }}
                          style={styles.queueThumb}
                        />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text
                            style={[
                              styles.queueTitle,
                              isCurrent && { color: COLORS.primary },
                            ]}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          <Text style={styles.queueArtist} numberOfLines={1}>
                            {item.artist}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {isCurrent ? (
                        <View style={styles.playingDot} />
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleRemoveFromQueue(item.id)}
                          style={styles.removeBtn}
                        >
                          <Trash2 size={16} color="#FF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </ScaleDecorator>
                );
              }}
            />
          </GestureHandlerRootView>
        </View>
      </View>
    </Modal>
  );

  const renderPlaylistSelector = () => (
    <View style={styles.options}>
      <View style={styles.modalHeader}>
        <Text style={styles.sectionTitle}>Listelerim</Text>
        <TouchableOpacity onPress={() => setModalVisible(false)}>
          <X color="#FFF" size={28} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isAlreadyInPlaylist = item.items?.some(
            (t) => t.id === currentTrack.id,
          );
          return (
            <TouchableOpacity
              style={[
                styles.option,
                isAlreadyInPlaylist && {
                  borderColor: COLORS.primary,
                  borderWidth: 1.5,
                  backgroundColor: "rgba(255, 69, 0, 0.1)",
                },
              ]}
              onPress={() => handlePlaylistToggle(item.id)}
            >
              <ListMusic
                size={22}
                color={isAlreadyInPlaylist ? COLORS.primary : COLORS.textSub}
              />
              <Text
                style={[
                  styles.optionText,
                  isAlreadyInPlaylist && {
                    color: COLORS.primary,
                    fontWeight: "800",
                  },
                ]}
              >
                {item.name}
              </Text>
              <View style={{ marginLeft: "auto" }}>
                {isAlreadyInPlaylist ? (
                  <X color={COLORS.primary} size={18} />
                ) : (
                  <ListPlus color={COLORS.textSub} size={18} />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg }]}>
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          {renderPlaylistSelector()}
        </SafeAreaView>
      </Modal>

      {renderQueueSheet()}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.canGoBack() && navigation.goBack()}
        >
          <ChevronLeft color={COLORS.textMain} size={32} />
        </TouchableOpacity>
      </View>

      <View style={styles.mainWrapper}>
        <View style={[styles.cardPanel, { backgroundColor: COLORS.cardBg }]}>
          <View style={styles.rightSideActions}>
            <TouchableOpacity onPress={() => toggleFavorite(currentTrack)}>
              <Heart
                size={24}
                color={
                  isFavorite(currentTrack.id) ? COLORS.primary : COLORS.textMain
                }
                fill={
                  isFavorite(currentTrack.id) ? COLORS.primary : "transparent"
                }
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <ListPlus size={24} color={COLORS.textMain} />
            </TouchableOpacity>

            <TouchableOpacity
              disabled={queueButtonDisabled}
              onPress={
                queueButtonDisabled ? undefined : () => setQueueVisible(true)
              }
            >
              <ListMusic
                size={24}
                color={
                  queueButtonDisabled ? COLORS.textDisabled : COLORS.primary
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!prevTrackExists}
              onPress={prevTrackExists ? playPrev : undefined}
            >
              <SkipBack
                size={24}
                color={prevTrackExists ? COLORS.textMain : COLORS.textDisabled}
                fill={prevTrackExists ? COLORS.textMain : COLORS.textDisabled}
              />
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!nextTrackExists}
              onPress={nextTrackExists ? playNext : undefined}
            >
              <SkipForward
                size={24}
                color={nextTrackExists ? COLORS.textMain : COLORS.textDisabled}
                fill={nextTrackExists ? COLORS.textMain : COLORS.textDisabled}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleToggle}
              style={[styles.playHalka, { borderColor: COLORS.primary }]}
            >
              {!isLoaded ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : isPlaying ? (
                <Pause size={38} color={COLORS.primary} fill={COLORS.primary} />
              ) : (
                <Play
                  size={38}
                  color={COLORS.primary}
                  fill={COLORS.primary}
                  style={{ marginLeft: 4 }}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomInfoArea}>
            <Text
              style={[styles.artistLabel, { color: COLORS.textMain }]}
              numberOfLines={1}
            >
              {currentTrack?.artist}
            </Text>
            <Text
              style={[styles.songLabel, { color: COLORS.textSub }]}
              numberOfLines={1}
            >
              {currentTrack?.title}
            </Text>

            <View style={styles.progressBox}>
              <View style={styles.timeRow}>
                {/* ✅ duration null ise "--:--" göster, gelince gerçek süreyi yaz */}
                <Text style={styles.timeText}>
                  {formatDuration(progress.position)}
                </Text>
                <Text style={styles.timeText}>
                  {progress.duration !== null
                    ? formatDuration(progress.duration)
                    : "--:--"}
                </Text>
              </View>
              {/* ✅ duration null ise maximumValue=1 kullan — slider atlamaz */}
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={progress.duration ?? 1}
                value={isSeeking ? seekValue : progress.position || 0}
                onSlidingStart={(value) => {
                  setIsSeeking(true);
                  setSeekValue(value);
                }}
                onValueChange={(value) => {
                  if (isSeeking) setSeekValue(value);
                }}
                onSlidingComplete={(value) => {
                  setIsSeeking(false);
                  handleSeek(value);
                }}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor="#000"
                thumbTintColor={COLORS.primary}
              />
            </View>
          </View>
        </View>

        <View style={styles.artworkLayer}>
          <Image
            source={{ uri: currentTrack?.thumbnail }}
            style={styles.imageStyle}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingLeft: 20, zIndex: 100 },
  mainWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  cardPanel: {
    width: width * 0.88,
    height: height * 0.52,
    borderRadius: 40,
    padding: 25,
    justifyContent: "flex-end",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
  },
  artworkLayer: {
    position: "absolute",
    top: height * 0.1,
    left: width * 0.04,
    zIndex: 99,
  },
  imageStyle: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: 35,
    backgroundColor: "#1A1A1A",
  },
  rightSideActions: {
    position: "absolute",
    right: 20,
    top: 30,
    alignItems: "center",
    gap: 22,
  },
  playHalka: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  bottomInfoArea: { width: "78%", marginBottom: 5 },
  artistLabel: { fontSize: 26, fontWeight: "900" },
  songLabel: { fontSize: 16, marginTop: 4 },
  progressBox: { marginTop: 20 },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  timeText: { fontSize: 11, fontWeight: "bold", color: COLORS.textSub },
  slider: { width: "105%", height: 30, marginLeft: -5 },
  modalContainer: { flex: 1, backgroundColor: COLORS.bg },
  options: { padding: 20, flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
  },
  optionText: {
    color: "#FFF",
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "600",
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: COLORS.drawerBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: height * 0.75,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  sheetTitle: { color: "#FFF", fontSize: 20, fontWeight: "800" },
  sheetSubtitle: { color: COLORS.textSub, fontSize: 13, marginTop: 3 },
  queueItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  queueItemActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
  },
  queueItemCurrent: {
    backgroundColor: "rgba(255,69,0,0.08)",
    borderRadius: 12,
  },
  dragHandle: { paddingHorizontal: 8, paddingVertical: 4 },
  queueItemInfo: { flex: 1, flexDirection: "row", alignItems: "center" },
  queueThumb: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: "#1A1A1A",
  },
  queueTitle: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  queueArtist: { color: COLORS.textSub, fontSize: 12, marginTop: 2 },
  playingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginHorizontal: 14,
  },
  removeBtn: { padding: 10 },
});
