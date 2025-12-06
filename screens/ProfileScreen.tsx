import React from "react";
import { StyleSheet, View, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import Spacer from "@/components/Spacer";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import { authService } from "@/utils/authService";
import { tiktokOAuthService } from "@/utils/tiktokOAuthService";

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "Profile">;
};

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  showBadge?: boolean;
  isDestructive?: boolean;
}

function MenuItem({ icon, label, onPress, showBadge, isDestructive }: MenuItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: theme.backgroundDefault,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.menuIcon,
            {
              backgroundColor: isDestructive
                ? Colors.light.error + "20"
                : Colors.light.primary + "20",
            },
          ]}
        >
          <Feather
            name={icon}
            size={18}
            color={isDestructive ? Colors.light.error : Colors.light.primary}
          />
        </View>
        <ThemedText
          style={[
            styles.menuLabel,
            isDestructive ? { color: Colors.light.error } : null,
          ]}
        >
          {label}
        </ThemedText>
      </View>
      <View style={styles.menuItemRight}>
        {showBadge ? (
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>1</ThemedText>
          </View>
        ) : null}
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </View>
    </Pressable>
  );
}

function PremiumBanner({ onPress, isPremium, planId }: { onPress: () => void; isPremium: boolean; planId: string | null }) {
  if (isPremium) {
    return (
      <View style={styles.premiumBanner}>
        <View
          style={[
            styles.premiumBannerGradient,
            { backgroundColor: Colors.light.success },
          ]}
        >
          <View style={styles.premiumBannerContent}>
            <View style={[styles.premiumIconContainer, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
              <Feather name="check-circle" size={24} color="white" />
            </View>
            <View style={styles.premiumTextContainer}>
              <ThemedText style={styles.premiumTitle}>
                WaveUp+ Actif
              </ThemedText>
              <ThemedText style={styles.premiumSubtitle}>
                Plan {planId === "monthly" ? "mensuel" : "annuel"}
              </ThemedText>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="white" />
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.premiumBanner,
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.premiumBannerGradient}>
        <View style={styles.premiumBannerContent}>
          <View style={styles.premiumIconContainer}>
            <Feather name="zap" size={24} color="white" />
          </View>
          <View style={styles.premiumTextContainer}>
            <ThemedText style={styles.premiumTitle}>
              Passer à WaveUp+
            </ThemedText>
            <ThemedText style={styles.premiumSubtitle}>
              Débloquez toutes les fonctionnalités premium
            </ThemedText>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color="white" />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { theme } = useTheme();
  const premiumStatus = usePremiumStatus();

  const handleDisconnect = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnecter",
          style: "destructive",
          onPress: async () => {
            try {
              await tiktokOAuthService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: "Profile" }],
              });
            } catch (error) {
              Alert.alert("Erreur", "Erreur lors de la déconnexion");
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter de WaveUp?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnecter",
          style: "destructive",
          onPress: async () => {
            try {
              await authService.signOut();
              await tiktokOAuthService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: "Profile" }],
              });
            } catch (error) {
              Alert.alert("Erreur", "Erreur lors de la déconnexion");
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenScrollView>
      <Animated.View
        entering={FadeInUp.delay(100).duration(500)}
        style={[styles.profileCard, { backgroundColor: theme.backgroundDefault }]}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Feather name="user" size={32} color={Colors.light.primary} />
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>@toncreateur</ThemedText>
            <View style={styles.connectedBadge}>
              <View style={styles.connectedDot} />
              <ThemedText style={[styles.connectedText, { color: theme.textSecondary }]}>
                TikTok connecté
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.profileStat}>
            <ThemedText style={styles.profileStatValue}>12.4K</ThemedText>
            <ThemedText style={[styles.profileStatLabel, { color: theme.textSecondary }]}>
              Abonnés
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <View style={styles.profileStat}>
            <ThemedText style={styles.profileStatValue}>156K</ThemedText>
            <ThemedText style={[styles.profileStatLabel, { color: theme.textSecondary }]}>
              Likes
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <View style={styles.profileStat}>
            <ThemedText style={styles.profileStatValue}>2.3M</ThemedText>
            <ThemedText style={[styles.profileStatLabel, { color: theme.textSecondary }]}>
              Vues
            </ThemedText>
          </View>
        </View>

        <Pressable
          onPress={handleDisconnect}
          style={({ pressed }) => [
            styles.disconnectButton,
            {
              backgroundColor: theme.backgroundSecondary,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="link-2" size={16} color={theme.text} />
          <ThemedText style={styles.disconnectText}>Déconnecter TikTok</ThemedText>
        </Pressable>
      </Animated.View>

      <Spacer height={Spacing.lg} />

      <PremiumBanner 
        onPress={() => navigation.navigate("WaveUpPlus")} 
        isPremium={premiumStatus.tier !== "free"}
        planId={premiumStatus.planId}
      />

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h4">À qui s'adresse WaveUp</ThemedText>
      <Spacer height={Spacing.lg} />

      <View style={[styles.audienceCard, { backgroundColor: Colors.light.success + "10", borderColor: Colors.light.success }]}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: Spacing.lg }}>
          <View style={[styles.audienceIcon, { backgroundColor: Colors.light.success + "20" }]}>
            <ThemedText style={{ fontSize: 20 }}>🎯</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.audienceTitle, { color: Colors.light.success }]}>
              Pour les micro-créateurs
            </ThemedText>
            <Spacer height={Spacing.xs} />
            <ThemedText style={styles.audienceText}>
              • 3 idées IA par jour gratuites
            </ThemedText>
            <ThemedText style={styles.audienceText}>
              • Plan personnalisé pour ton contenu
            </ThemedText>
            <ThemedText style={styles.audienceText}>
              • Hashtags et musiques tendances
            </ThemedText>
            <Spacer height={Spacing.md} />
            <ThemedText style={[styles.audienceSubtext, { color: Colors.light.success, fontWeight: "600" }]}>
              Atteins tes 500 ou 1000 abonnés en structurant ton contenu et en publiant au bon moment.
            </ThemedText>
          </View>
        </View>
      </View>

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h4">Paramètres</ThemedText>
      <Spacer height={Spacing.lg} />

      <Animated.View entering={FadeInUp.delay(200).duration(400)}>
        <MenuItem
          icon="bell"
          label="Notifications"
          onPress={() => navigation.navigate("Settings")}
          showBadge
        />
      </Animated.View>
      <Spacer height={Spacing.sm} />

      <Animated.View entering={FadeInUp.delay(250).duration(400)}>
        <MenuItem
          icon="globe"
          label="Langue"
          onPress={() => navigation.navigate("Settings")}
        />
      </Animated.View>
      <Spacer height={Spacing.sm} />

      <Animated.View entering={FadeInUp.delay(300).duration(400)}>
        <MenuItem
          icon="moon"
          label="Apparence"
          onPress={() => navigation.navigate("Settings")}
        />
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h4">À propos</ThemedText>
      <Spacer height={Spacing.lg} />

      <Animated.View entering={FadeInUp.delay(350).duration(400)}>
        <MenuItem
          icon="help-circle"
          label="Aide & Support"
          onPress={() => {}}
        />
      </Animated.View>
      <Spacer height={Spacing.sm} />

      <Animated.View entering={FadeInUp.delay(400).duration(400)}>
        <MenuItem
          icon="file-text"
          label="Conditions d'utilisation"
          onPress={() => {}}
        />
      </Animated.View>
      <Spacer height={Spacing.sm} />

      <Animated.View entering={FadeInUp.delay(450).duration(400)}>
        <MenuItem
          icon="shield"
          label="Politique de confidentialité"
          onPress={() => {}}
        />
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInUp.delay(500).duration(400)}>
        <MenuItem
          icon="log-out"
          label="Déconnexion"
          onPress={handleLogout}
          isDestructive
        />
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <View style={styles.versionContainer}>
        <ThemedText style={[styles.versionText, { color: theme.textSecondary }]}>
          WaveUp v1.0.0
        </ThemedText>
      </View>

      <Spacer height={Spacing["4xl"]} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    marginLeft: Spacing.lg,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
  },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.success,
    marginRight: Spacing.xs,
  },
  connectedText: {
    fontSize: 13,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  profileStat: {
    alignItems: "center",
  },
  profileStatValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  profileStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  disconnectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  disconnectText: {
    fontSize: 14,
    fontWeight: "500",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 16,
    marginLeft: Spacing.md,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.light.error,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  versionContainer: {
    alignItems: "center",
  },
  versionText: {
    fontSize: 12,
  },
  premiumBanner: {
    marginHorizontal: Spacing.lg,
  },
  premiumBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  premiumBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  premiumIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    marginBottom: 2,
  },
  audienceCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
  },
  audienceIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
    marginTop: 2,
  },
  audienceTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  audienceText: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: Spacing.xs,
  },
  audienceSubtext: {
    fontSize: 12,
    lineHeight: 16,
  },
  premiumSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
});
