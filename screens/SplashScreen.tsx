import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useAudioPlayer } from "expo-audio";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { Colors } from "@/constants/theme";

const { width, height } = Dimensions.get("window");

const oceanSound = require("@/assets/audio/waves-custom.wav");

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const player = useAudioPlayer(oceanSound);

  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    let isMounted = true;

    const playSound = async () => {
      try {
        player.volume = 0.6;
        player.play();
      } catch (error) {
        console.log("Audio playback error:", error);
      }
    };

    const startAnimations = () => {
      logoOpacity.value = withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });

      logoScale.value = withSpring(1, {
        damping: 12,
        stiffness: 100,
        mass: 1,
      });

      textOpacity.value = withDelay(
        600,
        withTiming(1, {
          duration: 600,
          easing: Easing.out(Easing.cubic),
        })
      );

      textTranslateY.value = withDelay(
        600,
        withSpring(0, {
          damping: 15,
          stiffness: 120,
        })
      );
    };

    playSound();
    startAnimations();

    const timer = setTimeout(() => {
      if (isMounted) {
        runOnJS(onFinish)();
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      try {
        if (player && typeof player?.pause === 'function') {
          player.pause();
        }
      } catch (error) {
        console.log("Error pausing audio:", error);
      }
    };
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <LinearGradient
      colors={["#1a1a2e", "#16213e", "#0f3460", "#533483"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.Text style={[styles.title, textAnimatedStyle]}>
          WaveUp
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, textAnimatedStyle]}>
          Surfez vers le succès TikTok
        </Animated.Text>
      </View>

      <View style={styles.waveDecoration}>
        <View style={styles.wave1} />
        <View style={styles.wave2} />
        <View style={styles.wave3} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 140,
    height: 140,
  },
  title: {
    fontSize: 48,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 2,
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      web: "'SF Pro Rounded', 'Poppins', 'Nunito', system-ui, sans-serif",
    }),
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 1,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
      web: "'SF Pro Text', 'Poppins', system-ui, sans-serif",
    }),
  },
  waveDecoration: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    overflow: "hidden",
  },
  wave1: {
    position: "absolute",
    bottom: -50,
    left: -50,
    right: -50,
    height: 150,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    borderTopLeftRadius: 1000,
    borderTopRightRadius: 1000,
    transform: [{ scaleX: 1.5 }],
  },
  wave2: {
    position: "absolute",
    bottom: -80,
    left: -30,
    right: -30,
    height: 120,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    borderTopLeftRadius: 800,
    borderTopRightRadius: 800,
    transform: [{ scaleX: 1.3 }],
  },
  wave3: {
    position: "absolute",
    bottom: -100,
    left: -20,
    right: -20,
    height: 100,
    backgroundColor: "rgba(0, 212, 255, 0.08)",
    borderTopLeftRadius: 600,
    borderTopRightRadius: 600,
  },
});
