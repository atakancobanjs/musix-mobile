// hooks/useAudioPlayer.js
import { Audio } from "expo-av";
import { useMusicStore } from "../store/musicStore";
import { useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

// ✅ soundRef export ediliyor — MiniPlayer kapatırken kullanır
export const soundRef = { current: null };
const isPlayingRef = { current: false };
const progressCallbackRef = { current: null };

function onPlaybackStatusUpdate(status) {
  if (!status.isLoaded) {
    if (status.error) console.error(`Oynatma hatası: ${status.error}`);
    return;
  }

  if (progressCallbackRef.current) {
    progressCallbackRef.current({
      position: status.positionMillis / 1000,
      duration: status.durationMillis ? status.durationMillis / 1000 : null,
    });
  }

  if (status.isPlaying !== isPlayingRef.current) {
    isPlayingRef.current = status.isPlaying;
    useMusicStore.getState().setIsPlaying(status.isPlaying);
  }

  if (status.didJustFinish && !status.isLooping) {
    const next = useMusicStore.getState().getNextTrack();
    if (next) play(next);
  }
}

async function play(track) {
  if (!track?.url) {
    console.log("Oynatılamaz: Geçersiz track veya URL");
    return;
  }

  try {
    let resolvedUrl = track.url;
    if (resolvedUrl.includes("/stream/url/")) {
      const res = await fetch(resolvedUrl);
      const data = await res.json();
      resolvedUrl = data.url;
      console.log("Resolved CDN URL:", resolvedUrl);
    }

    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }

    useMusicStore.setState({ currentTrack: track, isPlaying: false });

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: resolvedUrl },
      { shouldPlay: true, progressUpdateIntervalMillis: 500 },
      onPlaybackStatusUpdate,
    );

    soundRef.current = newSound;
    isPlayingRef.current = true;
    useMusicStore.setState({ isPlaying: true });

    const { recentlyPlayed } = useMusicStore.getState();
    const filtered = recentlyPlayed.filter((t) => t.id !== track.id);
    const updated = [track, ...filtered].slice(0, 20);
    useMusicStore.setState({ recentlyPlayed: updated });
    AsyncStorage.setItem("recentlyPlayed", JSON.stringify(updated));
  } catch (error) {
    console.error("Oynatırken kritik hata:", error);
    Toast.show({
      text1: "Oynatma Hatası",
      text2: "Ses dosyası açılamadı.",
      type: "error",
      position: "top",
      visibilityTime: 4000,
    });
    useMusicStore.setState({ currentTrack: null, isPlaying: false });
  }
}

async function handleToggle() {
  if (!soundRef.current) return;
  try {
    if (isPlayingRef.current) {
      await soundRef.current.pauseAsync();
      isPlayingRef.current = false;
      useMusicStore.getState().setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      isPlayingRef.current = true;
      useMusicStore.getState().setIsPlaying(true);
    }
  } catch (e) {
    console.error("Toggle hatası:", e);
  }
}

async function handleSeek(value) {
  if (soundRef.current) {
    await soundRef.current.setPositionAsync(value * 1000).catch(() => {});
  }
}

function playNext() {
  const next = useMusicStore.getState().getNextTrack();
  if (next) play(next);
}

function playPrev() {
  const prev = useMusicStore.getState().getPrevTrack();
  if (prev) play(prev);
  else soundRef.current?.setPositionAsync(0).catch(() => {});
}

export const useAudioPlayer = (onProgressUpdate) => {
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: 1,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1,
        playThroughEarpieceAndroid: false,
      });
    }
  }, []);

  useEffect(() => {
    if (onProgressUpdate) {
      progressCallbackRef.current = onProgressUpdate;
    }
    return () => {
      if (onProgressUpdate) {
        progressCallbackRef.current = null;
      }
    };
  }, [onProgressUpdate]);

  return { play, handleToggle, handleSeek, playNext, playPrev };
};
