import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import Spacer from "@/components/Spacer";
import { ideasStorageService, SavedIdea } from "@/utils/ideasStorageService";

function IdeaCard({ idea, onDelete }: { idea: SavedIdea; onDelete: () => void }) {
  const { theme } = useTheme();
  const typeIcons: Record<SavedIdea["type"], string> = {
    bio: "user",
    comment: "message-circle",
    dm: "send",
    caption: "type",
    script: "film",
  };

  return (
    <View style={[styles.ideaCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.ideaHeader}>
        <View style={[styles.typeIcon, { backgroundColor: Colors.light.primary + "20" }]}>
          <Feather name={typeIcons[idea.type] as any} size={18} color={Colors.light.primary} />
        </View>
        <View style={styles.ideaTitle}>
          <ThemedText style={styles.title}>{idea.title}</ThemedText>
          <ThemedText style={styles.date}>
            {new Date(idea.savedAt).toLocaleDateString("fr-FR")}
          </ThemedText>
        </View>
        <Pressable onPress={onDelete}>
          <Feather name="trash-2" size={18} color={Colors.light.error} />
        </Pressable>
      </View>
      <ThemedText style={styles.content}>{idea.content.substring(0, 100)}...</ThemedText>
      <View style={styles.rating}>
        {[...Array(5)].map((_, i) => (
          <Feather
            key={i}
            name="star"
            size={12}
            color={i < idea.rating ? Colors.light.warning : Colors.light.primary + "30"}
          />
        ))}
      </View>
    </View>
  );
}

export default function IdeasGalleryScreen() {
  const { theme } = useTheme();
  const [ideas, setIdeas] = useState<SavedIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    setLoading(false);
    const savedIdeas = await ideasStorageService.getSavedIdeas();
    setIdeas(savedIdeas);
  };

  const handleDelete = async (id: string) => {
    await ideasStorageService.deleteIdea(id);
    setIdeas(ideas.filter((idea) => idea.id !== id));
  };

  if (loading) {
    return (
      <ScreenScrollView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Chargement...</ThemedText>
      </ScreenScrollView>
    );
  }

  if (ideas.length === 0) {
    return (
      <ScreenScrollView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Galerie d'Idées</ThemedText>
        </View>
        <Spacer height={Spacing.xl} />
        <View style={styles.emptyState}>
          <Feather name="inbox" size={64} color={Colors.light.primary + "40"} />
          <ThemedText style={styles.emptyText}>Aucune idée sauvegardée</ThemedText>
          <ThemedText style={styles.emptySubtext}>Générez et sauvegardez vos meilleures idées!</ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Galerie d'Idées</ThemedText>
        <ThemedText style={styles.subtitle}>{ideas.length} idées sauvegardées</ThemedText>
      </View>

      <Spacer height={Spacing.lg} />

      {ideas.map((idea) => (
        <View key={idea.id}>
          <IdeaCard idea={idea} onDelete={() => handleDelete(idea.id)} />
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
  ideaCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  ideaHeader: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  ideaTitle: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  content: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  rating: {
    flexDirection: "row",
    gap: 4,
  },
  emptyState: {
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: Spacing.sm,
  },
});
