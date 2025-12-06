import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DashboardStackNavigator from "@/navigation/DashboardStackNavigator";
import IdeasStackNavigator from "@/navigation/IdeasStackNavigator";
import TrendsStackNavigator from "@/navigation/TrendsStackNavigator";
import ToolsStackNavigator from "@/navigation/ToolsStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import LeaderboardScreen from "@/screens/LeaderboardScreen";
import IdeasGalleryScreen from "@/screens/IdeasGalleryScreen";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { securityService, type SecurityFlag } from "@/utils/securityService";

export type MainTabParamList = {
  DashboardTab: undefined;
  IdeasTab: undefined;
  TrendsTab: undefined;
  ToolsTab: undefined;
  ProfileTab: undefined;
  LeaderboardTab: undefined;
  GalleryTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

interface FloatingActionButtonProps {
  onPress: () => void;
}

function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.fabContainer,
        {
          bottom: 49 + insets.bottom + Spacing.sm,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.fab,
          {
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const DisabledTab = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Feather name="lock" size={48} color={Colors.light.error} />
    <Text style={{ marginTop: 12, fontSize: 14, fontWeight: "600", color: "#666" }}>
      Module indisponible
    </Text>
  </View>
);

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const [enabledModules, setEnabledModules] = useState<SecurityFlag[]>([
    "AI",
    "LEADERBOARD",
    "ANALYTICS",
    "IDEAS",
    "TRENDS",
  ]);

  useEffect(() => {
    const checkSecurity = async () => {
      const modules = await securityService.getEnabledModules();
      setEnabledModules(modules);
    };

    const interval = setInterval(checkSecurity, 5000);
    checkSecurity();

    return () => clearInterval(interval);
  }, []);

  const isModuleEnabled = (flag: SecurityFlag) => enabledModules.includes(flag);

  return (
    <>
      <Tab.Navigator
        initialRouteName="DashboardTab"
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.tabIconDefault,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: Platform.select({
              ios: "transparent",
              android: theme.backgroundRoot,
            }),
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarBackground: () =>
            Platform.OS === "ios" ? (
              <BlurView
                intensity={100}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            ) : null,
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="DashboardTab"
          component={DashboardStackNavigator}
          options={{
            title: "Tableau",
            tabBarIcon: ({ color, size }) => (
              <Feather name="bar-chart-2" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="IdeasTab"
          component={isModuleEnabled("IDEAS") ? IdeasStackNavigator : DisabledTab}
          options={{
            title: "Idées",
            tabBarIcon: ({ color, size }) => (
              <Feather name="zap" size={size} color={isModuleEnabled("IDEAS") ? color : Colors.light.error} />
            ),
            tabBarBadge: isModuleEnabled("IDEAS") ? undefined : "!",
          }}
        />
        <Tab.Screen
          name="TrendsTab"
          component={TrendsStackNavigator}
          options={{
            title: "Tendances",
            tabBarIcon: ({ color, size }) => (
              <Feather name="trending-up" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ToolsTab"
          component={ToolsStackNavigator}
          options={{
            title: "Outils",
            tabBarIcon: ({ color, size }) => (
              <Feather name="tool" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="LeaderboardTab"
          component={LeaderboardScreen}
          options={{
            title: "Classement",
            tabBarIcon: ({ color, size }) => (
              <Feather name="award" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="GalleryTab"
          component={IdeasGalleryScreen}
          options={{
            title: "Galerie",
            tabBarIcon: ({ color, size }) => (
              <Feather name="bookmark" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileStackNavigator}
          options={{
            title: "Profil",
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <FloatingActionButton onPress={() => {}} />
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
