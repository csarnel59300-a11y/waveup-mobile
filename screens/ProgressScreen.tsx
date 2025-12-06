import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import Spacer from "@/components/Spacer";
import { progressService, type MetricSnapshot } from "@/utils/progressService";
import { recommendationsService } from "@/utils/recommendationsService";

interface StatsCardProps {
  icon: string;
  label: string;
  value: string;
  growth: string;
  isPositive: boolean;
  color: string;
}

function StatsCard({ icon, label, value, growth, isPositive, color }: StatsCardProps) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.delay(200).duration(400)}>
      <View style={[styles.statsCard, { backgroundColor: theme.backgroundDefault, borderColor: Colors.light.primary + "20" }]}>
        <View style={[styles.iconBox, { backgroundColor: color + "15" }]}>
          <Feather name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.statsContent}>
          <ThemedText style={styles.statsLabel}>{label}</ThemedText>
          <ThemedText style={styles.statsValue}>{value}</ThemedText>
          <View style={styles.growthContainer}>
            <Feather
              name={isPositive ? "trending-up" : "trending-down"}
              size={12}
              color={isPositive ? Colors.light.success : Colors.light.error}
            />
            <ThemedText style={[styles.growthText, { color: isPositive ? Colors.light.success : Colors.light.error }]}>
              {growth}
            </ThemedText>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

interface TimelineItemProps {
  date: string;
  followers: number;
  likes: number;
  engagement: number;
}

function TimelineItem({ date, followers, likes, engagement }: TimelineItemProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.timelineItem, { backgroundColor: theme.backgroundDefault, borderColor: Colors.light.primary + "20" }]}>
      <View style={styles.dateContainer}>
        <ThemedText style={styles.dateText}>{new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}</ThemedText>
      </View>
      <View style={styles.metricsRow}>
        <View style={styles.metricBadge}>
          <Feather name="users" size={12} color={Colors.light.primary} />
          <ThemedText style={styles.metricValue}>{(followers / 1000).toFixed(1)}K</ThemedText>
        </View>
        <View style={styles.metricBadge}>
          <Feather name="heart" size={12} color={Colors.light.secondary} />
          <ThemedText style={styles.metricValue}>{(likes / 1000).toFixed(0)}K</ThemedText>
        </View>
        <View style={styles.metricBadge}>
          <Feather name="zap" size={12} color={Colors.light.warning} />
          <ThemedText style={styles.metricValue}>{engagement.toFixed(1)}%</ThemedText>
        </View>
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState<MetricSnapshot[]>([]);
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [stats, setStats] = useState<{ [key: string]: string }>({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const loadMetrics = async () => {
    setLoading(true);
    const recentMetrics = await progressService.getRecentMetrics(period);
    setMetrics(recentMetrics);
    const calculatedStats = progressService.calculateStats(recentMetrics);
    setStats(calculatedStats);
    
    // Get recommendations
    const recs = await recommendationsService.getRecommendations(recentMetrics);
    setRecommendations(recs);
    
    // Get period comparison
    if (period === 30 && recentMetrics.length >= 14) {
      const firstHalf = recentMetrics.slice(0, Math.floor(recentMetrics.length / 2));
      const secondHalf = recentMetrics.slice(Math.floor(recentMetrics.length / 2));
      const comps = recommendationsService.comparePeriods(firstHalf, secondHalf);
      setComparisons(comps);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <ScreenScrollView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Chargement...</ThemedText>
      </ScreenScrollView>
    );
  }

  const latestMetric = metrics[metrics.length - 1];

  return (
    <ScreenScrollView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Historique de Progression</ThemedText>
      </View>

      <Spacer height={Spacing.lg} />

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <>
          <ThemedText style={styles.sectionTitle}>Recommandations</ThemedText>
          <Spacer height={Spacing.md} />
          {recommendations.map((rec, idx) => (
            <View key={idx}>
              <Animated.View
                entering={FadeInUp.delay(idx * 100).duration(400)}
                style={[styles.recommendationCard, { backgroundColor: theme.backgroundDefault }]}
              >
                <View style={[styles.recIcon, { backgroundColor: Colors.light.secondary + "20" }]}>
                  <Feather name={rec.icon as any} size={20} color={Colors.light.secondary} />
                </View>
                <View style={styles.recContent}>
                  <ThemedText style={styles.recTitle}>{rec.title}</ThemedText>
                  <ThemedText style={styles.recDesc}>{rec.description}</ThemedText>
                </View>
                <View style={styles.scoreBox}>
                  <ThemedText style={styles.score}>{rec.score}%</ThemedText>
                </View>
              </Animated.View>
              <Spacer height={Spacing.md} />
            </View>
          ))}
          <Spacer height={Spacing.lg} />
        </>
      )}

      {/* Comparison */}
      {comparisons.length > 0 && (
        <>
          <ThemedText style={styles.sectionTitle}>Comparaison Périodes</ThemedText>
          <Spacer height={Spacing.md} />
          {comparisons.map((comp, idx) => (
            <View key={idx}>
              <View style={[styles.comparisonCard, { backgroundColor: theme.backgroundDefault }]}>
                <ThemedText style={styles.compLabel}>{comp.label}</ThemedText>
                <View style={styles.compBar}>
                  <View
                    style={[
                      styles.compValue,
                      {
                        width: `${Math.min(100, Math.abs(comp.change))}%`,
                        backgroundColor:
                          comp.direction === "up" ? Colors.light.success : Colors.light.error,
                      },
                    ]}
                  />
                </View>
                <ThemedText style={[styles.compChange, { color: comp.direction === "up" ? Colors.light.success : Colors.light.error }]}>
                  {comp.direction === "up" ? "+" : ""}{comp.change}%
                </ThemedText>
              </View>
              <Spacer height={Spacing.md} />
            </View>
          ))}
          <Spacer height={Spacing.lg} />
        </>
      )}

      {/* Period selector */}
      <View style={styles.periodSelector}>
        {[7, 30, 90].map((p) => (
          <Pressable
            key={p}
            onPress={() => setPeriod(p as 7 | 30 | 90)}
            style={[
              styles.periodButton,
              period === p && { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
              period !== p && { borderColor: Colors.light.primary + "30" },
            ]}
          >
            <ThemedText style={[styles.periodText, period === p && { color: "#FFFFFF" }]}>
              {p}J
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <Spacer height={Spacing.lg} />

      {/* Current metrics */}
      {latestMetric && (
        <>
          <StatsCard
            icon="users"
            label="Abonnés"
            value={`${(latestMetric.followers / 1000).toFixed(1)}K`}
            growth={stats.followersGrowth || "+0%"}
            isPositive={!stats.followersGrowth?.startsWith('-')}
            color={Colors.light.primary}
          />
          <Spacer height={Spacing.md} />
          <StatsCard
            icon="heart"
            label="Likes"
            value={`${(latestMetric.likes / 1000).toFixed(0)}K`}
            growth={stats.likesGrowth || "+0%"}
            isPositive={!stats.likesGrowth?.startsWith('-')}
            color={Colors.light.secondary}
          />
          <Spacer height={Spacing.md} />
          <StatsCard
            icon="eye"
            label="Vues"
            value={`${(latestMetric.views / 1000).toFixed(0)}K`}
            growth={stats.viewsGrowth || "+0%"}
            isPositive={!stats.viewsGrowth?.startsWith('-')}
            color={Colors.light.warning}
          />
          <Spacer height={Spacing.md} />
          <StatsCard
            icon="zap"
            label="Engagement"
            value={`${stats.avgEngagement || latestMetric.engagementRate.toFixed(1)}%`}
            growth={`Moy. ${period}J`}
            isPositive={true}
            color="#F59E0B"
          />
        </>
      )}

      <Spacer height={Spacing.lg} />

      {/* Timeline */}
      <ThemedText style={styles.timelineTitle}>Chronologie</ThemedText>
      <Spacer height={Spacing.md} />

      {metrics.reverse().slice(0, 10).map((metric) => (
        <View key={metric.date}>
          <TimelineItem
            date={metric.date}
            followers={metric.followers}
            likes={metric.likes}
            engagement={metric.engagementRate}
          />
          <Spacer height={Spacing.sm} />
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
    marginBottom: Spacing.sm,
  },
  periodSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  periodText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  statsCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.md,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContent: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.7,
    marginBottom: Spacing.xs,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  growthContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.xs,
  },
  growthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  timelineItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  dateContainer: {
    marginBottom: Spacing.sm,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  metricsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  metricBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  recommendationCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    gap: Spacing.md,
  },
  recIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  recDesc: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: Spacing.xs,
  },
  scoreBox: {
    alignItems: "center",
  },
  score: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.secondary,
  },
  comparisonCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  compLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  compBar: {
    height: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  compValue: {
    height: "100%",
  },
  compChange: {
    fontSize: 13,
    fontWeight: "700",
  },
});
