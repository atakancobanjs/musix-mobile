// screens/SplashScreen.js
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";

const { height } = Dimensions.get("window");

const COLORS = {
  bg: "#0E0C0B",
  primary: "#FF4500",
  textMain: "#FFFFFF",
  textSub: "#A0A0A0",
};

export default function SplashScreen({ navigation }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: -8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10 && g.dy < 0,

      onPanResponderMove: (_, g) => {
        if (g.dy < 0) {
          translateY.setValue(g.dy);
          opacity.setValue(Math.max(0, 1 + g.dy / (height * 0.4)));
        }
      },

      onPanResponderRelease: (_, g) => {
        if (g.dy < -80 || g.vy < -0.5) {
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: -height,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            navigation.replace("Main");
          });
        } else {
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              friction: 6,
              tension: 80,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    }),
  ).current;

  return (
    <View style={styles.outerContainer}>
      <Animated.View
        style={[styles.container, { transform: [{ translateY }], opacity }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.logoWrapper}>
          <View style={styles.logoBox}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>Musix</Text>
          <View style={{ alignItems: "center", gap: 4 }}>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://about-bl2.pages.dev/")}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: "#A855F7",
                  fontSize: 15,
                  fontWeight: "bold",
                  letterSpacing: 0.5,
                  textDecorationLine: "underline",
                }}
              >
                Atakan Çoban
              </Text>
            </TouchableOpacity>

            <Text
              style={[styles.builtBy, { fontSize: 12, color: COLORS.textSub }]}
            >
              Tarafından Geliştirildi
            </Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.swipeIndicator,
            { transform: [{ translateY: arrowAnim }] },
          ]}
        >
          <View style={[styles.chevronLine, { opacity: 0.25 }]} />
          <View style={[styles.chevronLine, { opacity: 0.55 }]} />
          <View style={[styles.chevronLine, { opacity: 1 }]} />
          <Text style={styles.swipeText}>Yukarı Kaydır</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg,
  },
  logoWrapper: {
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 28,
    // backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    overflow: "hidden",
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  appName: {
    color: COLORS.textMain,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  builtBy: {
    color: COLORS.textSub,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  swipeIndicator: {
    position: "absolute",
    bottom: 52,
    alignItems: "center",
    gap: 5,
  },
  chevronLine: {
    width: 22,
    height: 2.5,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }, { translateX: -4 }],
    marginVertical: 1,
  },
  swipeText: {
    color: COLORS.textSub,
    fontSize: 12,
    letterSpacing: 1.2,
    marginTop: 8,
  },
});
