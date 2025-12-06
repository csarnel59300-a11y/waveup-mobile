import React, { useState, useEffect } from "react";
import { StyleSheet, ActivityIndicator, View, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import LoginScreen from "@/screens/LoginScreen";
import SplashScreen from "@/screens/SplashScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { authService } from "@/utils/authService";

type AppState = "splash" | "login" | "main" | "loading";

export default function App() {
  const [appState, setAppState] = useState<AppState>("splash");

  useEffect(() => {
    // Initialize Stripe on app startup (mobile only)
    if (Platform.OS !== "web") {
      const loadStripe = async () => {
        try {
          const { initializeStripe } = await import("@/utils/stripeClient");
          await initializeStripe();
        } catch (error) {
          console.warn("Stripe initialization skipped:", error);
        }
      };
      loadStripe();
    }
  }, []);

  useEffect(() => {
    // Restore session on app launch
    const restoreSession = async () => {
      try {
        const user = await authService.restoreSession();
        if (user) {
          setAppState("main");
        }
      } catch (error) {
        console.log("Session restore failed:", error);
      }
    };

    // Only restore after splash
    if (appState === "login") {
      restoreSession();
    }
  }, [appState]);

  const handleSplashFinish = () => {
    setAppState("loading");
    setTimeout(() => {
      setAppState("login");
    }, 300);
  };

  const handleLogin = () => {
    setAppState("main");
  };

  const renderContent = () => {
    switch (appState) {
      case "splash":
        return <SplashScreen onFinish={handleSplashFinish} />;
      case "loading":
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00D4FF" />
          </View>
        );
      case "login":
        return <LoginScreen onLogin={handleLogin} />;
      case "main":
        return (
          <NavigationContainer>
            <MainTabNavigator />
          </NavigationContainer>
        );
    }
  };

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.root}>
          <KeyboardProvider>
            {renderContent()}
            <StatusBar style={appState === "splash" ? "light" : "auto"} />
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
  },
});
