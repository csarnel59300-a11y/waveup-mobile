import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Platform,
  Share,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import Spacer from "@/components/Spacer";
import { PremiumService, getDailyLimit } from "@/utils/premiumService";
import {
  generateDailyPlan,
  defaultDailyPlan,
  type DailyPlan,
  type DailyIdea,
} from "@/utils/trendingService";

interface IdeaItemProps {
  idea: DailyIdea;
  index: number;
}

function IdeaItem({ idea, index }: IdeaItemProps) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <Pressable
        style={({ pressed }) => [
          styles.ideaItem,
          {
            backgroundColor: theme.backgroundDefault,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={styles.ideaHeader}>
          <View style={styles.ideaNumber}>
            <ThemedText style={styles.ideaNumberText}>{index + 1}</ThemedText>
          </View>
          <View style={styles.ideaTimeContainer}>
            <Feather name="clock" size={14} color={Colors.light.primary} />
            <ThemedText style={styles.ideaTime}>{idea.postingTime}</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.ideaTitle}>{idea.title}</ThemedText>
        <ThemedText
          style={[styles.ideaDescription, { color: theme.textSecondary }]}
        >
          {idea.description}
        </ThemedText>

        <View style={styles.hashtagsRow}>
          {idea.hashtags.map((tag) => (
            <View
              key={tag}
              style={[
                styles.hashtag,
                { backgroundColor: Colors.light.primary + "20" },
              ]}
            >
              <ThemedText style={styles.hashtagText}>{tag}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.ideaFooter}>
          <View style={styles.viewsEstimate}>
            <Feather name="trending-up" size={14} color={Colors.light.primary} />
            <ThemedText style={styles.viewsText}>{idea.estimatedViews}</ThemedText>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {
              // Share la vidéo idea
              if (Platform.OS !== "web") {
                Share.share({
                  message: `Je dois créer cette vidéo TikTok: ${idea.title}\n${idea.description}\n${idea.hashtags.join(" ")}`,
                });
              }
            }}
          >
            <Feather name="share-2" size={16} color={Colors.light.primary} />
            <ThemedText style={styles.actionButtonText}>Partager</ThemedText>
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function DailyPlanScreen() {
  const { theme } = useTheme();
  const { tier } = usePremiumStatus();
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>(defaultDailyPlan);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedIdeas, setUsedIdeas] = useState(0);
  
  // Obtenir la limite selon le tier
  const dailyLimit = getDailyLimit(tier as "free" | "monthly" | "annual" | "pro");
  const visibleIdeas = tier === "pro" ? dailyPlan.ideas : dailyPlan.ideas.slice(0, dailyLimit);

  useEffect(() => {
    const loadDailyPlan = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const plan = await generateDailyPlan();
        setDailyPlan(plan);
        const used = await PremiumService.getIdeasUsedToday();
        setUsedIdeas(used);
      } catch (err) {
        console.error("Erreur lors du chargement du plan:", err);
        setError("Impossible de charger le plan. Utilisation du plan par défaut.");
        setDailyPlan(defaultDailyPlan);
      } finally {
        setIsLoading(false);
      }
    };

    loadDailyPlan();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const plan = await generateDailyPlan(true);
      setDailyPlan(plan);
      setError(null);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors du rechargement du plan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenScrollView>
      <View
        style={[
          styles.headerCard,
          { backgroundColor: Colors.light.primary + "15" },
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <ThemedText style={styles.headerLabel}>Plan du jour</ThemedText>
            <ThemedText style={styles.headerDate}>{dailyPlan.date}</ThemedText>
          </View>
          <Feather name="calendar" size={32} color={Colors.light.primary} />
        </View>
        <Spacer height={Spacing.md} />
        <View style={styles.bestTimeContainer}>
          <Feather name="zap" size={16} color={Colors.light.secondary} />
          <ThemedText style={styles.bestTimeText}>
            Meilleur créneau: {dailyPlan.bestPostingTime}
          </ThemedText>
        </View>
      </View>

      <Spacer height={Spacing.lg} />

      {error ? (
        <>
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: Colors.light.error + "20" },
            ]}
          >
            <Feather name="alert-circle" size={20} color={Colors.light.error} />
            <ThemedText style={{ color: Colors.light.error, marginLeft: Spacing.sm }}>
              {error}
            </ThemedText>
          </View>
          <Spacer height={Spacing.lg} />
        </>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Feather
            name="loader"
            size={40}
            color={Colors.light.primary}
            style={styles.spinner}
          />
          <ThemedText style={{ fontSize: 16, marginTop: Spacing.lg }}>
            Génération du plan...
          </ThemedText>
        </View>
      ) : (
        <>
          <ThemedText style={styles.sectionTitle}>
            Vos vidéos du jour
          </ThemedText>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.md }}>
            <ThemedText style={{ fontSize: 14, opacity: 0.7 }}>
              Tu as utilisé {usedIdeas}/{dailyLimit} idées aujourd'hui
            </ThemedText>
            {tier === "free" && (
              <ThemedText style={{ fontSize: 12, color: Colors.light.primary }}>
                Passer à WaveUp+ pour {dailyLimit === 3 ? "5 ou 10" : "plus"}
              </ThemedText>
            )}
          </View>
          <Spacer height={Spacing.md} />

          {visibleIdeas.map((idea, index) => (
            <View key={idea.id}>
              <IdeaItem idea={idea} index={index} />
              {index < visibleIdeas.length - 1 ? (
                <Spacer height={Spacing.lg} />
              ) : null}
            </View>
          ))}

          <Spacer height={Spacing["2xl"]} />

          <ThemedText style={styles.sectionTitle}>
            Hashtags tendances du jour
          </ThemedText>
          <Spacer height={Spacing.md} />

          <View style={styles.trendingHashtagsContainer}>
            {dailyPlan.trendingHashtags.map((tag) => (
              <Pressable
                key={tag}
                style={[
                  styles.trendingHashtag,
                  { backgroundColor: Colors.light.secondary + "20" },
                ]}
                onPress={() => {
                  // Copier le hashtag
                  if (Platform.OS !== "web") {
                    console.log("Hashtag copied:", tag);
                  }
                }}
              >
                <ThemedText style={styles.trendingHashtagText}>{tag}</ThemedText>
              </Pressable>
            ))}
          </View>

          <Spacer height={Spacing["2xl"]} />

          <Pressable
            onPress={handleRefresh}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.refreshButton,
              {
                backgroundColor: Colors.light.primary,
                opacity: pressed || isLoading ? 0.7 : 1,
              },
            ]}
          >
            <Feather
              name={isLoading ? "loader" : "refresh-cw"}
              size={20}
              color="#FFFFFF"
            />
            <ThemedText style={styles.refreshButtonText}>
              {isLoading ? "Rechargement..." : "Actualiser le plan"}
            </ThemedText>
          </Pressable>

          <Spacer height={Spacing["3xl"]} />

          <View style={[styles.tipsSection, { backgroundColor: Colors.light.primary + "08" }]}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Spacing.lg }}>
              <Feather name="zap" size={20} color={Colors.light.primary} style={{ marginRight: Spacing.md }} />
              <ThemedText style={styles.tipsSectionTitle}>
                Tips pour booster votre compte
              </ThemedText>
            </View>

            <View style={styles.tipItem}>
              <ThemedText style={styles.tipNumber}>1</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.tipTitle}>Publiez tous les jours</ThemedText>
                <ThemedText style={styles.tipText}>
                  Utilisez les 3 idées quotidiennes. La consistance = croissance
                </ThemedText>
              </View>
            </View>

            <Spacer height={Spacing.md} />

            <View style={styles.tipItem}>
              <ThemedText style={styles.tipNumber}>2</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.tipTitle}>Respectez les horaires suggérés</ThemedText>
                <ThemedText style={styles.tipText}>
                  Poster au bon moment = +40% vues et engagement
                </ThemedText>
              </View>
            </View>

            <Spacer height={Spacing.md} />

            <View style={styles.tipItem}>
              <ThemedText style={styles.tipNumber}>3</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.tipTitle}>Utilisez les hashtags niche</ThemedText>
                <ThemedText style={styles.tipText}>
                  Les hashtags tendances ont 200M vues. Les nôtres: 8K-50K (plus facile!)
                </ThemedText>
              </View>
            </View>

            <Spacer height={Spacing.md} />

            <View style={styles.tipItem}>
              <ThemedText style={styles.tipNumber}>4</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.tipTitle}>Passer à WaveUp+ après 2 semaines</ThemedText>
                <ThemedText style={styles.tipText}>
                  5-10 idées/jour = croissance 8x plus rapide vers vos 500 abonnés
                </ThemedText>
              </View>
            </View>
          </View>

          <Spacer height={Spacing["4xl"]} />
        </>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.7,
  },
  headerDate: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: Spacing.xs,
  },
  bestTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  bestTimeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  ideaItem: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  ideaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  ideaNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  ideaNumberText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  ideaTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  ideaTime: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  ideaTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  ideaDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  hashtagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  hashtag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  hashtagText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.light.primary,
  },
  ideaFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewsEstimate: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  viewsText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  trendingHashtagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  trendingHashtag: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  trendingHashtagText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.secondary,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  spinner: {
    transform: [{ rotate: "0deg" }],
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  tipsSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  tipsSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primary,
    color: "white",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
    paddingTop: 3,
    flexShrink: 0,
  },
  tipTitle: {
    fontWeight: "600",
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  tipText: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },
});
