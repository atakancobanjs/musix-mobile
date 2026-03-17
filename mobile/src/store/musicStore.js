// store/musicStore.js
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useMusicStore = create((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  favorites: [],
  playlists: [],
  recentlyPlayed: [],
  // ✅ progress KALDIRILDI — PlayerScreen'in kendi local state'i olacak

  initStore: async () => {
    try {
      const [favs, lists, recent] = await Promise.all([
        AsyncStorage.getItem("favorites"),
        AsyncStorage.getItem("playlists"),
        AsyncStorage.getItem("recentlyPlayed"),
      ]);
      set({
        favorites: favs ? JSON.parse(favs) : [],
        playlists: lists ? JSON.parse(lists) : [],
        recentlyPlayed: recent ? JSON.parse(recent) : [],
      });
    } catch (e) {
      console.error("Depolama yükleme hatası:", e);
    }
  },

  setQueue: (tracks) => set({ queue: tracks }),

  createPlaylist: async (name) => {
    const newPlaylist = { id: Date.now().toString(), name, items: [] };
    const updated = [...get().playlists, newPlaylist];
    set({ playlists: updated });
    await AsyncStorage.setItem("playlists", JSON.stringify(updated));
  },

  deletePlaylist: async (playlistId) => {
    const updated = get().playlists.filter((pl) => pl.id !== playlistId);
    set({ playlists: updated });
    await AsyncStorage.setItem("playlists", JSON.stringify(updated));
  },

  addToPlaylist: async (playlistId, track) => {
    const updated = get().playlists.map((pl) => {
      if (pl.id !== playlistId) return pl;
      const exists = pl.items.find((t) => t.id === track.id);
      return exists ? pl : { ...pl, items: [...pl.items, track] };
    });
    set({ playlists: updated });
    await AsyncStorage.setItem("playlists", JSON.stringify(updated));
  },

  removeFromPlaylist: async (playlistId, trackId) => {
    const updated = get().playlists.map((pl) =>
      pl.id === playlistId
        ? { ...pl, items: pl.items.filter((t) => t.id !== trackId) }
        : pl,
    );
    set({ playlists: updated });
    await AsyncStorage.setItem("playlists", JSON.stringify(updated));
  },

  toggleFavorite: async (track) => {
    const { favorites } = get();
    const isFav = favorites.find((t) => t.id === track.id);
    const updated = isFav
      ? favorites.filter((t) => t.id !== track.id)
      : [...favorites, track];
    set({ favorites: updated });
    await AsyncStorage.setItem("favorites", JSON.stringify(updated));
  },

  getNextTrack: () => {
    const { queue, currentTrack } = get();
    if (!queue.length) return null;
    const idx = queue.findIndex((t) => t.id === currentTrack?.id);
    if (idx === -1) return null;
    return queue[(idx + 1) % queue.length];
  },

  getPrevTrack: () => {
    const { queue, currentTrack } = get();
    if (!queue.length) return null;
    const idx = queue.findIndex((t) => t.id === currentTrack?.id);
    if (idx === -1) return null;
    return queue[(idx - 1 + queue.length) % queue.length];
  },

  // ✅ setPlaybackStatus KALDIRILDI
  setIsPlaying: (status) => set({ isPlaying: status }),
  setPlaying: (status) => set({ isPlaying: status }),

  setCurrentTrack: (track) => {
    set({ currentTrack: track, isPlaying: true });
    const filtered = get().recentlyPlayed.filter((t) => t.id !== track.id);
    const updated = [track, ...filtered].slice(0, 20);
    set({ recentlyPlayed: updated });
    AsyncStorage.setItem("recentlyPlayed", JSON.stringify(updated));
  },

  isFavorite: (trackId) => get().favorites.some((t) => t.id === trackId),
}));
