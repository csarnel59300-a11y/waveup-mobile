import React from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import Spacer from "@/components/Spacer";

interface Creator {
  id: string;
  rank: number;
  name: string;
  followers: number;
  engagement: number;
  category: string;
  trend: "up" | "down" | "stable";
}

const MOCK_CREATORS: Creator[] = [
  {
    id: "1",
    rank: 1,
    name: "Emma Content",
    followers: 245000,
    engagement: 8.5,
    category: "Fashion",
    trend: "up",
  },
  {
    id: "2",
    rank: 2,
    name: "Alex Studio",
    followers: 189000,
    engagement: 7.2,
    category: "Créatif",
    trend: "up",
  },
  {
    id: "3",
    rank: 3,
    name: "Vous (Mock)",
    followers: 12400,
    engagement: 4.3,
    category: "Multi",
    trend: "up",
  },
  {
    id: "4",
    rank: 4,
    name: "Jordan Vibes",
    followers: 98000,
    engagement: 6.1,
    category: "Musique",
    trend: "down",
  },
  {
    id: "5",
    rank: 5,
    name: "Lisa Vlog",
    followers: 156000,
    engagement: 5.8,
    category: "Divertissement",
    trend: "stable",
  },
];

function CreatorCard({ creator, isCurrentUser }: { creator: Creator; isCurrentUser: boolean }) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.delay(creator.rank * 100).duration(400)}>
      <View
        style={[
          styles.creatorCard,
          {
            backgroundColor: isCurrentUser ? Colors.light.primary + "15" : theme.backgroundDefault,
            borderColor: isCurrentUser ? Colors.light.primary : Colors.light.primary + "20",
          },
        ]}
      >
        <View style={styles.rankBadge}>
          <ThemedText style={styles.rankText}>#{creator.rank}</ThemedText>
        </View>
        <View style={styles.creatorInfo}>
          <ThemedText style={styles.creatorName}>{creator.name}</ThemedText>
          <ThemedText style={styles.category}>{creator.category}</ThemedText>
          <View style={styles.metrics}>
            <Feather name="users" size={12} color={Colors.light.primary} />
            <ThemedText style={styles.metricValue}>{(creator.followers / 1000).toFixed(0)}K</ThemedText>
          </View>
        </View>
        <View style={styles.engagementBox}>
          <ThemedText style={styles.engagement}>{creator.engagement}%</ThemedText>
          <Feather
            name={creator.trend === "up" ? "trending-up" : creator.trend === "down" ? "trending-down" : "minus"}
            size={16}
            color={
              creator.trend === "up" ? Colors.light.success : creator.trend === "down" ? Colors.light.error : Colors.light.warning
            }
          />
        </View>
      </View>
    </Animated.View>
  );
}

export default function LeaderboardScreen() {
  const { theme } = useTheme();

  return (
    <ScreenScrollView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Leaderboard</ThemedText>
        <ThemedText style={styles.subtitle}>Top créateurs de votre niche</ThemedText>
      </View>

      <Spacer height={Spacing.lg} />

      {MOCK_CREATORS.map((creator) => (
        <View key={creator.id}>
          <CreatorCard creator={creator} isCurrentUser={creator.rank === 3} />
          <Spacer height={Spacing.md} />
        </View>
      ))}

      <Spacer height={Spacing.xl} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    marginTop: Spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: Spacing.xs,
  },
  creatorCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.md,
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    fontWeight: "700",
    fontSize: 16,
    color: Colors.light.primary,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: "600",
  },
  category: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  metrics: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.xs,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  engagementBox: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  engagement: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.secondary,
  },
});
