import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { X, Trash2, Heart } from "lucide-react-native";
import { useMusicStore } from "../store/musicStore";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

const COLORS = {
  bg: "#000000",
  primary: "#FF4500",
  cardBg: "#121212",
  textMain: "#FFFFFF",
  textSub: "#A0A0A0",
};

export default function RecentlyPlayedSheet({ visible, onClose, navigation }) {
  const {
    recentlyPlayed,
    removeFromRecentlyPlayed,
    toggleFavorite,
    isFavorite,
  } = useMusicStore();
  const { play } = useAudioPlayer();

  const handlePlay = (item, index) => {
    play(item, recentlyPlayed, index);
    onClose();
    navigation.navigate("Player");
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Son Dinlenenler</Text>
          <TouchableOpacity onPress={onClose}>
            <X color="#FFF" size={24} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={recentlyPlayed}
          keyExtractor={(item) => `sheet-${item.id}`}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item, index }) => (
            <View style={styles.item}>
              <TouchableOpacity
                style={styles.content}
                onPress={() => handlePlay(item, index)}
              >
                <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.artist}>{item.artist}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleFavorite(item)}
                style={styles.btn}
              >
                <Heart
                  size={20}
                  color={isFavorite(item.id) ? COLORS.primary : "#444"}
                  fill={isFavorite(item.id) ? COLORS.primary : "transparent"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removeFromRecentlyPlayed(item.id)}
                style={styles.btn}
              >
                <Trash2 size={20} color="#FF4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  headerTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: COLORS.cardBg,
    padding: 10,
    borderRadius: 12,
  },
  content: { flex: 1, flexDirection: "row", alignItems: "center" },
  thumb: { width: 50, height: 50, borderRadius: 6 },
  title: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  artist: { color: "#AAA", fontSize: 12 },
  btn: { padding: 10 },
});
