import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
  FadeInUp,
} from "react-native-reanimated";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import Spacer from "@/components/Spacer";

interface StatCardProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  delay: number;
  color: string;
}

function StatCard({ icon, label, value, trend, trendUp, delay, color }: StatCardProps) {
  const { theme } = useTheme();
  const animatedValue = useSharedValue(0);

  React.useEffect(() => {
    animatedValue.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animatedValue.value,
    transform: [{ translateY: (1 - animatedValue.value) * 20 }],
  }));

  return (
    <Animated.View
      style={[
        styles.statCard,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      {trend ? (
        <View style={styles.trendContainer}>
          <Feather
            name={trendUp ? "trending-up" : "trending-down"}
            size={14}
            color={trendUp ? Colors.light.success : Colors.light.error}
          />
          <ThemedText
            style={[
              styles.trendText,
              { color: trendUp ? Colors.light.success : Colors.light.error },
            ]}
          >
            {trend}
          </ThemedText>
        </View>
      ) : null}
    </Animated.View>
  );
}

interface InsightCardProps {
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}

function InsightCard({ title, description, icon, color }: InsightCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.insightCard,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.insightIcon, { backgroundColor: color + "20" }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <View style={styles.insightContent}>
        <ThemedText style={styles.insightTitle}>{title}</ThemedText>
        <ThemedText style={styles.insightDescription}>{description}</ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { theme } = useTheme();

  const stats = [
    {
      icon: "users" as const,
      label: "Abonnés",
      value: "12.4K",
      trend: "+8.2%",
      trendUp: true,
      color: Colors.light.primary,
    },
    {
      icon: "heart" as const,
      label: "Likes",
      value: "156K",
      trend: "+12.5%",
      trendUp: true,
      color: Colors.light.error,
    },
    {
      icon: "eye" as const,
      label: "Vues",
      value: "2.3M",
      trend: "+23.1%",
      trendUp: true,
      color: Colors.light.secondary,
    },
    {
      icon: "message-circle" as const,
      label: "Commentaires",
      value: "8.9K",
      trend: "-2.1%",
      trendUp: false,
      color: Colors.light.warning,
    },
  ];

  const insights = [
    {
      title: "Meilleur moment pour poster",
      description: "Entre 18h et 21h pour votre audience",
      icon: "clock" as const,
      color: Colors.light.primary,
    },
    {
      title: "Taux d'engagement",
      description: "4.2% - Supérieur à la moyenne",
      icon: "activity" as const,
      color: Colors.light.success,
    },
    {
      title: "Contenu tendance",
      description: "Les tutoriels fonctionnent bien",
      icon: "star" as const,
      color: Colors.light.warning,
    },
  ];

  return (
    <ScreenScrollView>
      <Animated.View entering={FadeInUp.delay(100).duration(500)}>
        <ThemedText type="h3">Bonjour, Créateur</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Voici un aperçu de vos performances
        </ThemedText>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View
        entering={FadeInUp.delay(200).duration(500)}
        style={[styles.profileCard, { backgroundColor: theme.backgroundDefault }]}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Feather name="user" size={28} color={Colors.light.primary} />
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>@toncreateur</ThemedText>
            <ThemedText style={[styles.profileHandle, { color: theme.textSecondary }]}>
              Lifestyle & Vlogs
            </ThemedText>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="edit-2" size={16} color={theme.text} />
          </Pressable>
        </View>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h4">Statistiques</ThemedText>
      <Spacer height={Spacing.lg} />

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={index * 100} />
        ))}
      </View>

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h4">Aperçus</ThemedText>
      <Spacer height={Spacing.lg} />

      {insights.map((insight, index) => (
        <Animated.View
          key={insight.title}
          entering={FadeInUp.delay(600 + index * 100).duration(400)}
        >
          <InsightCard {...insight} />
          {index < insights.length - 1 ? <Spacer height={Spacing.md} /> : null}
        </Animated.View>
      ))}

      <Spacer height={Spacing["4xl"]} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    marginTop: Spacing.xs,
  },
  profileCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
  },
  profileHandle: {
    fontSize: 14,
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    width: "47%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  insightContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  insightDescription: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
});
