import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, ScrollView, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import Spacer from "@/components/Spacer";
import { generateContentIdeas, type ContentIdea } from "@/utils/geminiService";

const categories = [
  { id: "all", label: "Tout", icon: "grid" },
  { id: "music", label: "Musique", icon: "music" },
  { id: "dance", label: "Danse", icon: "activity" },
  { id: "comedy", label: "Comédie", icon: "smile" },
  { id: "tutorial", label: "Tutoriels", icon: "book-open" },
  { id: "vlog", label: "Vlogs", icon: "video" },
];

// Idées par défaut si Gemini ne répond pas
const defaultContentIdeas: ContentIdea[] = [
  {
    id: "1",
    title: "Transition créative avec votre tenue",
    description:
      "Montrez votre transformation de style avec une transition fluide. Utilisez un son tendance pour maximiser la portée.",
    category: "dance",
    hashtags: ["#OOTD", "#Transition", "#StyleTikTok"],
    difficulty: "Facile",
    estimatedViews: "50K-100K",
  },
  {
    id: "2",
    title: "Tutoriel cuisine rapide 60s",
    description:
      "Une recette simple en moins d'une minute. Le format court capte l'attention et génère des partages.",
    category: "tutorial",
    hashtags: ["#RecetteFacile", "#Foodtok", "#Cuisine"],
    difficulty: "Moyen",
    estimatedViews: "100K-200K",
  },
  {
    id: "3",
    title: "Lip sync avec le son viral du moment",
    description:
      "Utilisez le son tendance #SummerVibes pour créer un contenu relatable. Ajoutez votre touche personnelle.",
    category: "music",
    hashtags: ["#LipSync", "#Viral", "#Trending"],
    difficulty: "Facile",
    estimatedViews: "200K+",
  },
  {
    id: "4",
    title: "POV humoristique quotidien",
    description:
      "Recréez une situation quotidienne drôle. Les POV relatables génèrent beaucoup d'engagement.",
    category: "comedy",
    hashtags: ["#POV", "#Humour", "#RelatableContent"],
    difficulty: "Moyen",
    estimatedViews: "80K-150K",
  },
  {
    id: "5",
    title: "Vlog journée productivité",
    description:
      "Partagez votre routine productive avec des astuces organisation. Ce format inspire et engage.",
    category: "vlog",
    hashtags: ["#Productivité", "#RoutineMatinale", "#Vlog"],
    difficulty: "Facile",
    estimatedViews: "30K-80K",
  },
];

interface CategoryChipProps {
  label: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
}

function CategoryChip({ label, icon, isSelected, onPress }: CategoryChipProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryChip,
        {
          backgroundColor: isSelected ? Colors.light.primary : theme.backgroundDefault,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Feather
        name={icon as keyof typeof Feather.glyphMap}
        size={16}
        color={isSelected ? "#FFFFFF" : theme.text}
      />
      <ThemedText
        style={[
          styles.categoryLabel,
          { color: isSelected ? "#FFFFFF" : theme.text },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

interface IdeaCardProps {
  idea: ContentIdea;
  index: number;
}

function IdeaCard({ idea, index }: IdeaCardProps) {
  const { theme } = useTheme();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Facile":
        return Colors.light.success;
      case "Moyen":
        return Colors.light.warning;
      default:
        return Colors.light.error;
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(400)}>
      <Pressable
        style={({ pressed }) => [
          styles.ideaCard,
          {
            backgroundColor: theme.backgroundDefault,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={styles.ideaHeader}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: Colors.light.primary + "20" },
            ]}
          >
            <Feather
              name={
                categories.find((c) => c.id === idea.category)?.icon as keyof typeof Feather.glyphMap || "grid"
              }
              size={14}
              color={Colors.light.primary}
            />
          </View>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(idea.difficulty) + "20" },
            ]}
          >
            <ThemedText
              style={[
                styles.difficultyText,
                { color: getDifficultyColor(idea.difficulty) },
              ]}
            >
              {idea.difficulty}
            </ThemedText>
          </View>
        </View>

        <ThemedText style={styles.ideaTitle}>{idea.title}</ThemedText>
        <ThemedText style={[styles.ideaDescription, { color: theme.textSecondary }]}>
          {idea.description}
        </ThemedText>

        <View style={styles.hashtagsContainer}>
          {idea.hashtags.map((hashtag: string) => (
            <View
              key={hashtag}
              style={[styles.hashtag, { backgroundColor: theme.backgroundSecondary }]}
            >
              <ThemedText style={styles.hashtagText}>{hashtag}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.ideaFooter}>
          <View style={styles.viewsEstimate}>
            <Feather name="eye" size={14} color={theme.textSecondary} />
            <ThemedText style={[styles.viewsText, { color: theme.textSecondary }]}>
              {idea.estimatedViews} vues estimées
            </ThemedText>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.useButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ThemedText style={styles.useButtonText}>Utiliser</ThemedText>
            <Feather name="arrow-right" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function IdeasScreen() {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>(defaultContentIdeas);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les idées depuis Gemini au démarrage
  useEffect(() => {
    const loadIdeas = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const ideas = await generateContentIdeas("TikTok général");
        setContentIdeas(ideas);
      } catch (err) {
        console.error("Erreur lors du chargement des idées:", err);
        setError("Impossible de charger les idées. Affichage des idées par défaut.");
        setContentIdeas(defaultContentIdeas);
      } finally {
        setIsLoading(false);
      }
    };

    loadIdeas();
  }, []);

  const filteredIdeas =
    selectedCategory === "all"
      ? contentIdeas
      : contentIdeas.filter((idea) => idea.category === selectedCategory);

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    try {
      const ideas = await generateContentIdeas("TikTok général");
      setContentIdeas(ideas);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors de la génération des idées");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScreenScrollView>
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
            Génération des idées en cours...
          </ThemedText>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <CategoryChip
                key={category.id}
                label={category.label}
                icon={category.icon}
                isSelected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
              />
            ))}
          </ScrollView>

          <Spacer height={Spacing.lg} />

          {filteredIdeas.map((idea, index) => (
            <View key={idea.id}>
              <IdeaCard idea={idea} index={index} />
              {index < filteredIdeas.length - 1 ? <Spacer height={Spacing.lg} /> : null}
            </View>
          ))}
        </>
      )}

      <Spacer height={Spacing["2xl"]} />

      <Pressable
        onPress={handleGenerateMore}
        disabled={isGenerating}
        style={({ pressed }) => [
          styles.generateButton,
          {
            backgroundColor: Colors.light.secondary,
            opacity: pressed || isGenerating ? 0.7 : 1,
          },
        ]}
      >
        <Feather
          name={isGenerating ? "loader" : "zap"}
          size={20}
          color="#FFFFFF"
        />
        <ThemedText style={styles.generateButtonText}>
          {isGenerating ? "Génération en cours..." : "Générer plus d'idées"}
        </ThemedText>
      </Pressable>

      <Spacer height={Spacing["4xl"]} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  spinner: {
    transform: [{ rotate: "0deg" }],
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.xl,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  ideaCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  ideaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  categoryBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  ideaTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  ideaDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  hashtagsContainer: {
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
  },
  ideaFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewsEstimate: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  viewsText: {
    fontSize: 12,
  },
  useButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  useButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
