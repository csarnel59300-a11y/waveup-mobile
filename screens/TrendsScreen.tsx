import React, { useState } from "react";
import { StyleSheet, View, Pressable, TextInput, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import Spacer from "@/components/Spacer";

const trendCategories = [
  { id: "all", label: "Tout" },
  { id: "music", label: "Musique" },
  { id: "dance", label: "Danse" },
  { id: "comedy", label: "Comédie" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "food", label: "Food" },
];

const trendingHashtags = [
  {
    id: "1",
    hashtag: "#SummerVibes2024",
    views: "2.4B",
    growth: "+156%",
    category: "lifestyle",
    isHot: true,
  },
  {
    id: "2",
    hashtag: "#DanceChallenge",
    views: "1.8B",
    growth: "+89%",
    category: "dance",
    isHot: true,
  },
  {
    id: "3",
    hashtag: "#RecetteFacile",
    views: "890M",
    growth: "+45%",
    category: "food",
    isHot: false,
  },
  {
    id: "4",
    hashtag: "#OOTD",
    views: "3.2B",
    growth: "+23%",
    category: "lifestyle",
    isHot: false,
  },
  {
    id: "5",
    hashtag: "#TikTokMadeMe",
    views: "5.6B",
    growth: "+67%",
    category: "all",
    isHot: true,
  },
  {
    id: "6",
    hashtag: "#MusicRemix",
    views: "1.2B",
    growth: "+34%",
    category: "music",
    isHot: false,
  },
  {
    id: "7",
    hashtag: "#POVFunny",
    views: "2.1B",
    growth: "+78%",
    category: "comedy",
    isHot: true,
  },
  {
    id: "8",
    hashtag: "#TransitionTrend",
    views: "980M",
    growth: "+112%",
    category: "dance",
    isHot: true,
  },
];

interface CategoryTabProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function CategoryTab({ label, isSelected, onPress }: CategoryTabProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryTab,
        {
          borderBottomColor: isSelected ? Colors.light.primary : "transparent",
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.categoryTabText,
          {
            color: isSelected ? Colors.light.primary : theme.textSecondary,
            fontWeight: isSelected ? "600" : "400",
          },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

interface HashtagCardProps {
  hashtag: (typeof trendingHashtags)[0];
  index: number;
  onUse: (hashtag: string) => void;
}

function HashtagCard({ hashtag, index, onUse }: HashtagCardProps) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.delay(index * 80).duration(400)}>
      <Pressable
        style={({ pressed }) => [
          styles.hashtagCard,
          {
            backgroundColor: theme.backgroundDefault,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <View style={styles.hashtagLeft}>
          <View style={styles.rankContainer}>
            <ThemedText style={[styles.rankText, { color: theme.textSecondary }]}>
              {index + 1}
            </ThemedText>
          </View>

          <View style={styles.hashtagInfo}>
            <View style={styles.hashtagHeader}>
              <ThemedText style={styles.hashtagName}>{hashtag.hashtag}</ThemedText>
              {hashtag.isHot ? (
                <View style={styles.hotBadge}>
                  <Feather name="zap" size={10} color="#FFFFFF" />
                </View>
              ) : null}
            </View>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Feather name="eye" size={12} color={theme.textSecondary} />
                <ThemedText style={[styles.statText, { color: theme.textSecondary }]}>
                  {hashtag.views}
                </ThemedText>
              </View>
              <View style={styles.stat}>
                <Feather name="trending-up" size={12} color={Colors.light.success} />
                <ThemedText style={[styles.statText, { color: Colors.light.success }]}>
                  {hashtag.growth}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => onUse(hashtag.hashtag)}
          style={({ pressed }) => [
            styles.useHashtagButton,
            {
              backgroundColor: Colors.light.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <ThemedText style={styles.useHashtagText}>Utiliser</ThemedText>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

export default function TrendsScreen() {
  const { theme, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedHashtag, setCopiedHashtag] = useState<string | null>(null);

  const filteredHashtags = trendingHashtags.filter((h) => {
    const matchesCategory =
      selectedCategory === "all" || h.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      h.hashtag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseHashtag = (hashtag: string) => {
    setCopiedHashtag(hashtag);
    setTimeout(() => setCopiedHashtag(null), 2000);
  };

  return (
    <ScreenScrollView>
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <Feather name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Rechercher un hashtag..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={20} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <Spacer height={Spacing.lg} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {trendCategories.map((category) => (
          <CategoryTab
            key={category.id}
            label={category.label}
            isSelected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
          />
        ))}
      </ScrollView>

      <Spacer height={Spacing.lg} />

      {copiedHashtag ? (
        <Animated.View
          entering={FadeInUp.duration(300)}
          style={[styles.copiedBanner, { backgroundColor: Colors.light.success }]}
        >
          <Feather name="check" size={16} color="#FFFFFF" />
          <ThemedText style={styles.copiedText}>
            {copiedHashtag} ajouté à votre liste
          </ThemedText>
        </Animated.View>
      ) : null}

      <Spacer height={Spacing.md} />

      {filteredHashtags.map((hashtag, index) => (
        <View key={hashtag.id}>
          <HashtagCard
            hashtag={hashtag}
            index={index}
            onUse={handleUseHashtag}
          />
          {index < filteredHashtags.length - 1 ? (
            <Spacer height={Spacing.md} />
          ) : null}
        </View>
      ))}

      <Spacer height={Spacing["4xl"]} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.xl,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  categoryTab: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
  },
  categoryTabText: {
    fontSize: 15,
  },
  copiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  copiedText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  hashtagCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  hashtagLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rankContainer: {
    width: 32,
    alignItems: "center",
  },
  rankText: {
    fontSize: 16,
    fontWeight: "700",
  },
  hashtagInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  hashtagHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  hashtagName: {
    fontSize: 16,
    fontWeight: "600",
  },
  hotBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.light.warning,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginTop: 4,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  useHashtagButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  useHashtagText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
