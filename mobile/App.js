import React, { useEffect } from "react";
import { StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import AppNavigator from "./src/navigation/AppNavigator";
// import { setupAudio } from "./src/services/audioPlayer";
import { useMusicStore } from "./src/store/musicStore";
import { toastConfig } from "./src/utils/toastConfig";

export default function App() {
  // Sadece initStore'u alıyoruz, çünkü her şeyi o hallediyor.
  const initStore = useMusicStore((state) => state.initStore);

  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Ses motoru ayarlarını başlat
        // await setupAudio();

        // 2. Yerel depolamadaki tüm verileri (Playlist, Favori vb.) yükle
        // Bu fonksiyon store içinde tanımladığımız initStore'dur.
        if (initStore) {
          await initStore();
        }
      } catch (error) {
        console.error("Uygulama başlatma hatası:", error);
      }
    };

    initApp();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <AppNavigator />
      <Toast config={toastConfig} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
