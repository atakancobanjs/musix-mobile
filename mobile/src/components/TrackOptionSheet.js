import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import {
  PlusCircle,
  Heart,
  ListPlus,
  X,
  ChevronLeft,
  ListMusic,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useMusicStore } from "../store/musicStore";

const COLORS = {
  overlay: "rgba(0,0,0,0.8)",
  card: "#121212",
  primary: "#FF4500",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  border: "#1A1A1A",
};

export default function TrackOptionsSheet({ visible, onClose, track }) {
  const [view, setView] = useState("options");
  const { playlists, addToPlaylist, toggleFavorite, isFavorite, addToQueue } =
    useMusicStore();

  if (!track) return null;
  const isFav = isFavorite(track.id);

  // Güncel Toast Fonksiyonu
  const notify = (type, title, sub) => {
    Toast.show({
      type: type,
      text1: title,
      text2: sub || "",
      visibilityTime: 2500,
      autoHide: true,
      topOffset: 50,
    });
  };

  const handleAddToPlaylist = (playlistId) => {
    addToPlaylist(playlistId, track);
    notify("success", "Listeye Eklendi", track.title);
    onClose();
    setView("options");
  };

  const handleAddToQueue = () => {
    // Sadece bu şarkıyı sıraya ekler
    addToQueue(track);
    notify("success", "Sıraya Eklendi", "Şarkı listenin sonuna eklendi.");
    onClose();
  };

  const renderOptions = () => (
    <View style={styles.options}>
      <TouchableOpacity
        style={styles.option}
        onPress={() => {
          toggleFavorite(track);
          notify(
            "success",
            isFav ? "Favorilerden Çıkarıldı" : "Favorilere Ekle",
          );
          onClose();
        }}
      >
        <Heart
          size={22}
          color={isFav ? COLORS.primary : COLORS.text}
          fill={isFav ? COLORS.primary : "transparent"}
        />
        <Text style={styles.optionText}>
          {isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => setView("playlists")}
      >
        <PlusCircle size={22} color={COLORS.text} />
        <Text style={styles.optionText}>Çalma Listesine Ekle</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleAddToQueue}>
        <ListPlus size={22} color={COLORS.text} />
        <Text style={styles.optionText}>Sıraya Ekle</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPlaylistSelector = () => (
    <View style={styles.options}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => setView("options")}
      >
        <ChevronLeft size={20} color={COLORS.sub} />
        <Text style={styles.backText}>Geri Dön</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Listelerim</Text>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleAddToPlaylist(item.id)}
          >
            <ListMusic size={22} color={COLORS.primary} />
            <Text style={styles.optionText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <View style={styles.header}>
                <Text style={styles.trackTitle} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={styles.artist}>{track.artist}</Text>
              </View>
              {view === "options" ? renderOptions() : renderPlaylistSelector()}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={22} color="#FF3B30" />
                <Text style={[styles.optionText, { color: "#FF3B30" }]}>
                  Kapat
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 30,
    paddingHorizontal: 20,
    maxHeight: "70%",
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#333",
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: 15,
  },
  header: {
    marginBottom: 15,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
    paddingBottom: 15,
  },
  trackTitle: { color: COLORS.text, fontSize: 16, fontWeight: "bold" },
  artist: { color: COLORS.sub, fontSize: 14, marginTop: 4 },
  options: { width: "100%" },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#222",
    gap: 15,
  },
  optionText: { color: COLORS.text, fontSize: 16, fontWeight: "500" },
  closeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    gap: 15,
    marginTop: 5,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
  },
  backText: { color: COLORS.sub, fontSize: 14 },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
