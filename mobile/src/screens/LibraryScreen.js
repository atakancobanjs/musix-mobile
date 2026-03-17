import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  SafeAreaView,
  Modal,
} from "react-native";
import {
  Heart,
  Trash2,
  Plus,
  ListMusic,
  X,
  Play,
  ChevronRight,
} from "lucide-react-native";
import { useMusicStore } from "../store/musicStore";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

const COLORS = {
  bg: "#000000",
  primary: "#FF4500",
  secondary: "#8A2BE2",
  cardBg: "#121212",
  textMain: "#FFFFFF",
  textSub: "#A0A0A0",
  drawerBg: "#161616",
};

export default function LibraryScreen({ navigation }) {
  const [tab, setTab] = useState("favorites");
  const [newName, setNewName] = useState("");
  const [showNew, setShowNew] = useState(false);

  // Drawer (Panel) Yönetimi
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    favorites,
    playlists,
    createPlaylist,
    deletePlaylist,
    toggleFavorite,
    isFavorite,
    setQueue,
  } = useMusicStore();

  const { play } = useAudioPlayer();

  const openPlaylistDrawer = (playlist) => {
    setSelectedPlaylist(playlist);
    setIsDrawerOpen(true);
  };

  const playPlaylist = (tracks, startIndex = 0) => {
    if (!tracks || tracks.length === 0) return;
    setQueue(tracks);
    play(tracks[startIndex]);
    setIsDrawerOpen(false); // Paneli kapat
    navigation.navigate("Player");
  };

  // --- DRAWER (MODAL) BİLEŞENİ ---
  const renderPlaylistDrawer = () => (
    <Modal
      visible={isDrawerOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsDrawerOpen(false)}
    >
      <View style={styles.drawerOverlay}>
        <View style={styles.drawerContent}>
          {/* Header */}
          <View style={styles.drawerHeader}>
            <View>
              <Text style={styles.drawerTitle}>{selectedPlaylist?.name}</Text>
              <Text style={styles.drawerSubTitle}>
                {selectedPlaylist?.items?.length || 0} Şarkı
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsDrawerOpen(false)}>
              <X color="#FFF" size={28} />
            </TouchableOpacity>
          </View>

          {/* Aksiyon Butonları */}
          <View style={styles.drawerActions}>
            <TouchableOpacity
              style={[styles.mainPlayBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => playPlaylist(selectedPlaylist?.items)}
            >
              <Play color="#000" size={24} fill="#000" />
              <Text style={styles.mainPlayBtnText}>Listeyi Çal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.drawerDeleteBtn}
              onPress={() => {
                Alert.alert("Sil", "Bu listeyi tamamen silmek istiyor musun?", [
                  { text: "Vazgeç" },
                  {
                    text: "Sil",
                    onPress: () => {
                      deletePlaylist(selectedPlaylist.id);
                      setIsDrawerOpen(false);
                    },
                    style: "destructive",
                  },
                ]);
              }}
            >
              <Trash2 color="#FF4444" size={20} />
            </TouchableOpacity>
          </View>

          {/* Şarkı Listesi */}
          <FlatList
            data={selectedPlaylist?.items}
            keyExtractor={(item) => `pl-track-${item.id}`}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <Text style={styles.empty}>Bu listede henüz şarkı yok.</Text>
            }
            renderItem={({ item, index }) => (
              <View style={styles.drawerTrackItem}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onPress={() => playPlaylist(selectedPlaylist.items, index)}
                >
                  <Image
                    source={{ uri: item.thumbnail }}
                    style={styles.smallThumb}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.trackTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    useMusicStore
                      .getState()
                      .removeFromPlaylist(selectedPlaylist.id, item.id);
                    const updatedPL = useMusicStore
                      .getState()
                      .playlists.find((p) => p.id === selectedPlaylist.id);
                    setSelectedPlaylist(updatedPL);
                  }}
                  style={{ padding: 10 }}
                >
                  <X color="#FF4444" size={18} />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Kütüphane</Text>

      {/* TABLAR */}
      <View style={styles.tabs}>
        {["favorites", "playlists"].map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.tab,
              tab === t && { borderBottomColor: COLORS.primary },
            ]}
            onPress={() => setTab(t)}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === t ? COLORS.primary : COLORS.textSub },
              ]}
            >
              {t === "favorites" ? "Favoriler" : "Playlistler"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FAVORİLER LİSTESİ */}
      {tab === "favorites" && (
        <FlatList
          data={favorites}
          keyExtractor={(item) => `fav-${item.id}`}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={styles.empty}>Henüz favori şarkın yok.</Text>
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.trackItem}
              onPress={() => {
                setQueue(favorites);
                play(item);
                navigation.navigate("Player");
              }}
            >
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.thumbnail}
              />
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {item.artist}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleFavorite(item)}
                style={styles.iconBtn}
              >
                <Heart
                  size={22}
                  color={COLORS.primary}
                  fill={isFavorite(item.id) ? COLORS.primary : "transparent"}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      {/* PLAYLISTLER LİSTESİ */}
      {tab === "playlists" && (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={[styles.createBtn, { borderColor: COLORS.secondary }]}
            onPress={() => setShowNew(!showNew)}
          >
            <Plus color={COLORS.secondary} size={20} />
            <Text style={[styles.createBtnText, { color: COLORS.secondary }]}>
              Yeni Playlist Oluştur
            </Text>
          </TouchableOpacity>

          {showNew && (
            <View style={styles.newRow}>
              <TextInput
                style={styles.newInput}
                placeholder="Liste adı yaz..."
                placeholderTextColor="#444"
                value={newName}
                onChangeText={setNewName}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => {
                  if (newName.trim()) {
                    createPlaylist(newName.trim());
                    setNewName("");
                    setShowNew(false);
                  }
                }}
                style={[styles.confirmBtn, { backgroundColor: COLORS.primary }]}
              >
                <Text style={styles.confirmBtnText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={playlists}
            keyExtractor={(item) => `pl-${item.id}`}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 100,
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.trackItem}
                onPress={() => openPlaylistDrawer(item)}
              >
                <View
                  style={[
                    styles.playlistIcon,
                    { backgroundColor: COLORS.secondary + "15" },
                  ]}
                >
                  <ListMusic color={COLORS.secondary} size={24} />
                </View>
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle}>{item.name}</Text>
                  <Text style={styles.trackArtist}>
                    {item.items?.length || 0} Şarkı
                  </Text>
                </View>
                <ChevronRight color="#444" size={24} />
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {renderPlaylistDrawer()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  headerTitle: {
    color: COLORS.textMain,
    fontSize: 28,
    fontWeight: "900",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: "#111",
  },
  tabText: { fontSize: 16, fontWeight: "800" },
  empty: {
    color: COLORS.textSub,
    textAlign: "center",
    marginTop: 50,
    fontSize: 15,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  thumbnail: { width: 52, height: 52, borderRadius: 10 },
  trackInfo: { flex: 1, marginLeft: 15 },
  trackTitle: { color: COLORS.textMain, fontSize: 15, fontWeight: "700" },
  trackArtist: { color: COLORS.textSub, fontSize: 12, marginTop: 3 },
  playlistIcon: {
    width: 52,
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtn: { padding: 8 },
  createBtn: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
  },
  createBtnText: { fontWeight: "800", fontSize: 15 },
  newRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  newInput: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    paddingHorizontal: 15,
    color: "#fff",
    height: 50,
    borderWidth: 1,
    borderColor: "#222",
  },
  confirmBtn: {
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: "center",
  },
  confirmBtnText: { color: "#000", fontWeight: "900" },

  // DRAWER STİLLERİ
  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  drawerContent: {
    backgroundColor: COLORS.drawerBg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: "80%",
    padding: 25,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  drawerTitle: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  drawerSubTitle: { color: COLORS.textSub, fontSize: 14, marginTop: 4 },
  drawerActions: { flexDirection: "row", gap: 12, marginBottom: 25 },
  mainPlayBtn: {
    flex: 1,
    height: 55,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  mainPlayBtnText: { color: "#000", fontWeight: "900", fontSize: 16 },
  drawerDeleteBtn: {
    width: 55,
    height: 55,
    backgroundColor: "#222",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  drawerTrackItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 10,
    borderRadius: 12,
  },
  smallThumb: { width: 45, height: 45, borderRadius: 8 },
});
