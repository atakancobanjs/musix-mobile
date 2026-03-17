// src/utils/toastConfig.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CheckCircle2, AlertCircle } from "lucide-react-native";

export const toastConfig = {
  // 'success' tipindeki toast tasarımı
  success: ({ text1, text2 }) => (
    <View style={styles.toastContainer}>
      <CheckCircle2 color="#FF4500" size={20} />
      <View style={styles.textContainer}>
        <Text style={styles.text1}>{text1}</Text>
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
  ),
  // 'error' tipindeki toast tasarımı
  error: ({ text1, text2 }) => (
    <View style={[styles.toastContainer, { borderLeftColor: "#FF3B30" }]}>
      <AlertCircle color="#FF3B30" size={20} />
      <View style={styles.textContainer}>
        <Text style={styles.text1}>{text1}</Text>
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    height: 60,
    width: "90%",
    backgroundColor: "#1A1A1A", // Uygulama kart rengin
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    borderLeftWidth: 5,
    borderLeftColor: "#FF4500", // Turuncu çizgi
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    gap: 5,
  },
  textContainer: { marginLeft: 15 },
  text1: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  text2: { color: "#A0A0A0", fontSize: 12 },
});
