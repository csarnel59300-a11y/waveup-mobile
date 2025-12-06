import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Image, Alert, ActivityIndicator, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { authService } from "@/utils/authService";
import { tiktokOAuthService } from "@/utils/tiktokOAuthService";

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  
  const waveOffset = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Reset loading state when component mounts (e.g., on logout)
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    // Handle deep link for OAuth callback
    if (Platform.OS !== "web") {
      const handleDeepLink = ({ url }: { url: string }) => {
        const code = Linking.parse(url).queryParams?.code as string;
        if (code) {
          handleOAuthCallback(code);
        }
      };

      const subscription = Linking.addEventListener("url", handleDeepLink);
      
      return () => {
        subscription.remove();
      };
    }
  }, []);

  React.useEffect(() => {
    waveOffset.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    logoScale.value = withSpring(1, { damping: 12 });
    logoOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: waveOffset.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const handleTikTokConnect = async () => {
    setIsLoading(true);
    try {
      // Initiate TikTok OAuth flow
      const result = await tiktokOAuthService.initiateLogin();
      
      // On web, this redirects so we don't reach here
      // On mobile, handle the result
      if (result) {
        onLogin();
      }
    } catch (err) {
      Alert.alert("Erreur de connexion", "Impossible de se connecter à TikTok: " + String(err));
      setIsLoading(false);
    }
  };

  const handleOAuthCallback = async (code: string) => {
    try {
      setIsLoading(true);
      const tokenData = await tiktokOAuthService.handleCallback(code);
      
      if (tokenData) {
        onLogin();
      }
    } catch (err) {
      Alert.alert("Erreur OAuth", "Une erreur s'est produite lors de l'authentification: " + String(err));
      setIsLoading(false);
    }
  };

  const handleAppleConnect = async () => {
    setIsLoading(true);
    try {
      const { user, error } = await authService.signUp(
        "user@apple.com",
        "temppass",
        "Apple User"
      );
      if (error || !user) {
        Alert.alert("Erreur de connexion", error || "Impossible de se connecter");
        setIsLoading(false);
        return;
      }
      await AsyncStorage.setItem('tiktok_user_id', (user as any).id || 'apple_' + Date.now());
      onLogin();
    } catch (err) {
      Alert.alert("Erreur", "Une erreur est survenue");
      setIsLoading(false);
    }
  };

  const handleGoogleConnect = async () => {
    setIsLoading(true);
    try {
      const { user, error } = await authService.signUp(
        "user@gmail.com",
        "temppass",
        "Google User"
      );
      if (error || !user) {
        Alert.alert("Erreur de connexion", error || "Impossible de se connecter");
        setIsLoading(false);
        return;
      }
      await AsyncStorage.setItem('tiktok_user_id', (user as any).id || 'google_' + Date.now());
      onLogin();
    } catch (err) {
      Alert.alert("Erreur", "Une erreur est survenue");
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ["#111827", "#1F2937"] : ["#00D4FF", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.waveContainer, waveStyle]}>
        <View style={[styles.wave, styles.wave1, { opacity: 0.3 }]} />
        <View style={[styles.wave, styles.wave2, { opacity: 0.2 }]} />
        <View style={[styles.wave, styles.wave3, { opacity: 0.1 }]} />
      </Animated.View>

      <View style={[styles.content, { paddingTop: insets.top + Spacing["4xl"] }]}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText
            style={styles.appName}
            lightColor="#FFFFFF"
            darkColor="#FFFFFF"
          >
            WaveUp
          </ThemedText>
          <ThemedText
            style={styles.tagline}
            lightColor="rgba(255,255,255,0.8)"
            darkColor="rgba(255,255,255,0.8)"
          >
            Boostez votre TikTok
          </ThemedText>
        </Animated.View>

        <View style={[styles.buttonsContainer, { paddingBottom: insets.bottom + Spacing["2xl"] }]}>
          <Pressable
            onPress={handleTikTokConnect}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              styles.tiktokButton,
              { opacity: pressed || isLoading ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="video" size={22} color="#FFFFFF" />
                <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                  Connecter avec TikTok
                </ThemedText>
              </>
            )}
          </Pressable>

          <Pressable
            onPress={handleAppleConnect}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              styles.appleButton,
              { opacity: pressed || isLoading ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="smartphone" size={22} color="#FFFFFF" />
                <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                  Continuer avec Apple
                </ThemedText>
              </>
            )}
          </Pressable>

          <Pressable
            onPress={handleGoogleConnect}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              styles.googleButton,
              { opacity: pressed || isLoading ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#1F2937" />
            ) : (
              <>
                <Feather name="mail" size={22} color="#1F2937" />
                <ThemedText style={styles.buttonText} lightColor="#1F2937" darkColor="#1F2937">
                  Continuer avec Google
                </ThemedText>
              </>
            )}
          </Pressable>

          <View style={styles.linksContainer}>
            <ThemedText
              style={styles.linkText}
              lightColor="rgba(255,255,255,0.7)"
              darkColor="rgba(255,255,255,0.7)"
            >
              En continuant, vous acceptez nos{" "}
            </ThemedText>
            <Pressable>
              <ThemedText
                style={styles.link}
                lightColor="#FFFFFF"
                darkColor="#FFFFFF"
              >
                Conditions d'utilisation
              </ThemedText>
            </Pressable>
            <ThemedText
              style={styles.linkText}
              lightColor="rgba(255,255,255,0.7)"
              darkColor="rgba(255,255,255,0.7)"
            >
              {" "}et notre{" "}
            </ThemedText>
            <Pressable>
              <ThemedText
                style={styles.link}
                lightColor="#FFFFFF"
                darkColor="#FFFFFF"
              >
                Politique de confidentialité
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  waveContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  wave: {
    position: "absolute",
    left: -100,
    right: -100,
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  wave1: {
    top: -200,
    transform: [{ rotate: "-5deg" }],
  },
  wave2: {
    top: -150,
    transform: [{ rotate: "3deg" }],
  },
  wave3: {
    top: -100,
    transform: [{ rotate: "-2deg" }],
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: Spacing["2xl"],
  },
  logoContainer: {
    alignItems: "center",
    marginTop: Spacing["5xl"],
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 24,
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: 40,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: 18,
  },
  buttonsContainer: {
    gap: Spacing.md,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  tiktokButton: {
    backgroundColor: "#000000",
  },
  appleButton: {
    backgroundColor: "#1F2937",
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  linksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  linkText: {
    fontSize: 12,
  },
  link: {
    fontSize: 12,
    textDecorationLine: "underline",
  },
});
