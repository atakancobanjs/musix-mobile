// components/MiniPlayer.js
import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
} from "react-native";
import { Play, Pause, SkipForward } from "lucide-react-native";
import { useMusicStore } from "../store/musicStore";
import { useAudioPlayer, soundRef } from "../hooks/useAudioPlayer";

const { width } = Dimensions.get("window");
const COLORS = { bg: "#121212", primary: "#FF4500", textMain: "#FFFFFF" };

export default function MiniPlayer({ navigation }) {
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const { handleToggle, playNext } = useAudioPlayer();

  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10,

      onPanResponderMove: (_, g) => {
        translateY.setValue(g.dy);
        const newOpacity = g.dy > 0 ? Math.max(0, 1 - g.dy / 150) : 1;
        opacity.setValue(newOpacity);
      },

      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) {
          // ✅ Aşağı sürükle — kapat
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 250,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => handleClosePlayer());
        } else if (g.dy < -80) {
          // Yukarı sürükle — PlayerScreen'e git
          Animated.timing(translateY, {
            toValue: -500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            navigation.navigate("Player");
            translateY.setValue(0);
            opacity.setValue(1);
          });
        } else {
          // Yetersiz mesafe — yerine dön
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              friction: 6,
              tension: 80,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },

      onPanResponderTerminate: () => {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      },
    }),
  ).current;

  const handleClosePlayer = async () => {
    try {
      // ✅ Ses nesnesini durdur ve bellekten temizle
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    } catch (e) {
      console.log("Ses kapatma hatası:", e);
    }

    // ✅ Store'u sıfırla — MiniPlayer kaybolur
    useMusicStore.setState({
      currentTrack: null,
      queue: [],
      isPlaying: false,
    });

    translateY.setValue(0);
    opacity.setValue(1);
  };

  if (!currentTrack) return null;

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.container,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.touchArea}
          onPress={() => navigation.navigate("Player")}
        >
          <Image
            source={{ uri: currentTrack.thumbnail }}
            style={styles.thumbnail}
          />
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.controls}>
          <TouchableOpacity onPress={handleToggle} style={styles.controlBtn}>
            {isPlaying ? (
              <Pause size={24} color="#FFF" fill="#FFF" />
            ) : (
              <Play size={24} color="#FFF" fill="#FFF" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={playNext} style={styles.controlBtn}>
            <SkipForward size={24} color="#FFF" fill="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    bottom: 85,
    width,
    alignItems: "center",
    zIndex: 999,
  },
  container: {
    width: width * 0.95,
    backgroundColor: COLORS.bg,
    height: 70,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#333",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  touchArea: { flex: 1, flexDirection: "row", alignItems: "center" },
  thumbnail: { width: 48, height: 48, borderRadius: 8 },
  info: { flex: 1, marginLeft: 12 },
  title: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  artist: { color: COLORS.primary, fontSize: 12, marginTop: 2 },
  controls: { flexDirection: "row", alignItems: "center" },
  controlBtn: { padding: 10, marginLeft: 5 },
});
