import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useStripe } from "@stripe/stripe-react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import Spacer from "@/components/Spacer";
import { subscriptionPlans, getSubscriptionDiscount } from "@/utils/paymentService";
import { PremiumService } from "@/utils/premiumService";
import { validatePromoCode, applyPromoCode } from "@/utils/promoService";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

type WaveUpPlusScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "WaveUpPlus">;
};

interface FeatureItemProps {
  icon: keyof typeof Feather.glyphMap;
  text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.featureItem}>
      <Feather
        name={icon}
        size={16}
        color={Colors.light.primary}
        style={styles.featureIcon}
      />
      <ThemedText style={styles.featureText}>{text}</ThemedText>
    </View>
  );
}

function PlanCard({
  plan,
  onSelect,
  isHighlighted,
}: {
  plan: (typeof subscriptionPlans)[0];
  onSelect: () => void;
  isHighlighted: boolean;
}) {
  const { theme } = useTheme();
  const discount = getSubscriptionDiscount(plan);

  return (
    <Animated.View
      entering={FadeInUp.delay(plan.id === "annual" ? 200 : 0)}
      style={[
        styles.planCard,
        {
          backgroundColor: isHighlighted
            ? Colors.light.primary + "15"
            : theme.backgroundDefault,
          borderColor: isHighlighted
            ? Colors.light.primary
            : Colors.light.primary + "30",
          borderWidth: isHighlighted ? 2 : 1,
        },
      ]}
    >
      {(plan.badge || plan.secondaryBadge) && (
        <View style={styles.badgeContainer}>
          {plan.badge && (
            <View
              style={[
                styles.badge,
                { backgroundColor: Colors.light.success },
              ]}
            >
              <ThemedText style={styles.badgeText}>{plan.badge}</ThemedText>
            </View>
          )}
          {plan.secondaryBadge && (
            <View
              style={[
                styles.badge,
                { backgroundColor: Colors.light.primary + "60" },
              ]}
            >
              <ThemedText style={styles.badgeText}>{plan.secondaryBadge}</ThemedText>
            </View>
          )}
        </View>
      )}

      <ThemedText style={styles.planName}>{plan.name}</ThemedText>
      <Spacer height={Spacing.sm} />

      <View style={styles.priceContainer}>
        <ThemedText style={styles.price}>${plan.price}</ThemedText>
        <ThemedText style={styles.period}>
          {plan.period === "monthly" ? "/mois" : "/an"}
        </ThemedText>
      </View>

      {plan.originalPrice && discount && (
        <View style={styles.discountContainer}>
          <ThemedText style={styles.originalPrice}>
            ${plan.originalPrice}
          </ThemedText>
          <View style={[styles.discountBadge, { backgroundColor: Colors.light.error + "20" }]}>
            <ThemedText style={[styles.discountText, { color: Colors.light.error }]}>
              -{discount}%
            </ThemedText>
          </View>
        </View>
      )}

      <Spacer height={Spacing.md} />
      <ThemedText style={styles.description}>{plan.description}</ThemedText>
      <Spacer height={Spacing.lg} />

      <View style={styles.featuresList}>
        {plan.features.map((feature, index) => (
          <FeatureItem
            key={index}
            icon={index % 3 === 0 ? "star" : index % 3 === 1 ? "zap" : "check"}
            text={feature}
          />
        ))}
      </View>

      <Spacer height={Spacing.lg} />

      <Pressable
        onPress={onSelect}
        style={({ pressed }) => [
          styles.selectButton,
          {
            backgroundColor: isHighlighted
              ? Colors.light.primary
              : Colors.light.primary + "20",
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.selectButtonText,
            {
              color: isHighlighted ? "white" : Colors.light.primary,
            },
          ]}
        >
          {isHighlighted ? "Sélectionné" : "Choisir"}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

export default function WaveUpPlusScreen({
  navigation,
}: WaveUpPlusScreenProps) {
  const { theme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoMessage("Entrez un code promo");
      return;
    }
    const result = validatePromoCode(promoCode);
    setPromoMessage(result.message);
    if (result.valid) {
      setPromoDiscount(result.discount);
    } else {
      setPromoDiscount(0);
    }
  };

  const handleSubscribe = async (planId: string) => {
    const plan = subscriptionPlans.find((p) => p.id === planId);
    if (!plan) return;

    setIsProcessing(true);
    try {
      Alert.alert(
        "Confirmation d'abonnement",
        `${plan.name}\n${plan.price}€ ${plan.period === "monthly" ? "par mois" : "par an"}\n\nConfirmer l'abonnement?`,
        [
          {
            text: "Annuler",
            onPress: () => setIsProcessing(false),
            style: "cancel",
          },
          {
            text: "Confirmer",
            onPress: async () => {
              try {
                // Activer le premium
                await PremiumService.setPremium(planId as "monthly" | "annual" | "pro");
                setSelectedPlan(planId);
                setIsProcessing(false);

                Alert.alert(
                  "Succès! 🎉",
                  `Bienvenue dans WaveUp+!\nVous pouvez maintenant accéder à toutes les fonctionnalités premium.`,
                  [
                    {
                      text: "Fermer",
                      onPress: () => navigation.goBack(),
                    },
                  ]
                );
              } catch (error) {
                console.error("Erreur lors de l'activation du premium:", error);
                setIsProcessing(false);
                Alert.alert("Erreur", "Impossible d'activer le premium. Veuillez réessayer.");
              }
            },
          },
        ]
      );
    } finally {
      // setIsProcessing is handled in the alert callbacks
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
    >
      <Animated.View entering={FadeInDown} style={styles.header}>
        <View style={styles.headerContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: Colors.light.primary + "20" },
            ]}
          >
            <Feather
              name="zap"
              size={32}
              color={Colors.light.primary}
            />
          </View>
          <Spacer height={Spacing.md} />
          <ThemedText style={styles.headerTitle}>WaveUp+</ThemedText>
          <Spacer height={Spacing.sm} />
          <ThemedText style={styles.headerSubtitle}>
            Débloquez tout le potentiel de votre compte TikTok
          </ThemedText>
        </View>
      </Animated.View>

      <Spacer height={Spacing.lg} />

      <View style={styles.content}>
        <View style={[styles.freeVersionCard, { backgroundColor: Colors.light.primary + "10", borderColor: Colors.light.primary + "30" }]}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View style={[styles.freeVersionIcon, { backgroundColor: Colors.light.primary + "20" }]}>
              <Feather name="gift" size={20} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.freeVersionTitle, { color: Colors.light.primary }]}>
                Code promo
              </ThemedText>
              <Spacer height={Spacing.xs} />
              <ThemedText style={styles.freeVersionText}>
                Entrez votre code promo pour obtenir une réduction
              </ThemedText>
              <Spacer height={Spacing.md} />
              <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                <TextInput
                  style={[
                    styles.promoInput,
                    { 
                      backgroundColor: theme.backgroundDefault,
                      borderColor: Colors.light.primary,
                      color: theme.text,
                      flex: 1,
                    },
                  ]}
                  placeholder="Ex: NOEL50"
                  placeholderTextColor={theme.text + "60"}
                  value={promoCode}
                  onChangeText={setPromoCode}
                  editable={!promoDiscount}
                />
                <Pressable
                  onPress={handleApplyPromo}
                  style={({ pressed }) => [
                    styles.promoButton,
                    {
                      backgroundColor: Colors.light.primary,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Feather name="check" size={16} color="white" />
                </Pressable>
              </View>
              {promoMessage && (
                <>
                  <Spacer height={Spacing.xs} />
                  <ThemedText style={[styles.freeVersionText, { color: promoDiscount > 0 ? Colors.light.success : Colors.light.error }]}>
                    {promoMessage}
                  </ThemedText>
                </>
              )}
              {promoDiscount > 0 && (
                <>
                  <Spacer height={Spacing.xs} />
                  <Pressable onPress={() => { setPromoCode(""); setPromoDiscount(0); setPromoMessage(""); }} style={{ marginTop: Spacing.sm }}>
                    <ThemedText style={[styles.freeVersionText, { color: Colors.light.primary, textDecorationLine: "underline" }]}>
                      Supprimer le code
                    </ThemedText>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>

        <Spacer height={Spacing["2xl"]} />

        <View style={[styles.freeVersionCard, { backgroundColor: Colors.light.success + "10", borderColor: Colors.light.success }]}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View style={[styles.freeVersionIcon, { backgroundColor: Colors.light.success + "20" }]}>
              <Feather name="gift" size={20} color={Colors.light.success} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.freeVersionTitle, { color: Colors.light.success }]}>
                Version Gratuite - WaveUp Free
              </ThemedText>
              <Spacer height={Spacing.xs} />
              <ThemedText style={styles.freeVersionText}>
                • 3 idées de contenu optimisées par jour
              </ThemedText>
              <ThemedText style={styles.freeVersionText}>
                • Accès aux hashtags tendances TikTok
              </ThemedText>
              <ThemedText style={styles.freeVersionText}>
                • Suggestions d'horaires de publication
              </ThemedText>
              <ThemedText style={styles.freeVersionText}>
                • Estimations de vues
              </ThemedText>
              <Spacer height={Spacing.xs} />
              <ThemedText style={[styles.freeVersionSubtext, { color: Colors.light.success }]}>
                Passer à WaveUp+ pour débloquer plus d'idées quotidiennes!
              </ThemedText>
            </View>
          </View>
        </View>

        <Spacer height={Spacing["2xl"]} />

        <ThemedText style={styles.sectionTitle}>Plans d'abonnement</ThemedText>
        <Spacer height={Spacing.md} />

        {subscriptionPlans.map((plan) => (
          <View key={plan.id}>
            <PlanCard
              plan={plan}
              onSelect={() => handleSubscribe(plan.id)}
              isHighlighted={selectedPlan === plan.id}
            />
            <Spacer height={Spacing.lg} />
          </View>
        ))}

        <View style={styles.infoBanner}>
          <Feather
            name="info"
            size={20}
            color={Colors.light.primary}
            style={styles.infoBannerIcon}
          />
          <View style={styles.infoBannerContent}>
            <ThemedText style={styles.infoBannerTitle}>
              Annulation facile
            </ThemedText>
            <ThemedText style={styles.infoBannerText}>
              Vous pouvez annuler votre abonnement à tout moment depuis vos paramètres.
            </ThemedText>
          </View>
        </View>

        <Spacer height={Spacing.xl} />

        <View style={styles.faqSection}>
          <ThemedText style={styles.faqTitle}>Avantages WaveUp+</ThemedText>
          <Spacer height={Spacing.md} />

          <View style={styles.faqItem}>
            <View
              style={[
                styles.faqIcon,
                { backgroundColor: Colors.light.primary + "20" },
              ]}
            >
              <Feather
                name="trending-up"
                size={16}
                color={Colors.light.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.faqItemTitle}>
                Tendances en temps réel
              </ThemedText>
              <ThemedText style={styles.faqItemText}>
                Accédez aux hashtags et tendances TikTok les plus actuels
              </ThemedText>
            </View>
          </View>

          <Spacer height={Spacing.md} />

          <View style={styles.faqItem}>
            <View
              style={[
                styles.faqIcon,
                { backgroundColor: Colors.light.primary + "20" },
              ]}
            >
              <Feather name="zap" size={16} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.faqItemTitle}>
                Suggestions IA illimitées
              </ThemedText>
              <ThemedText style={styles.faqItemText}>
                Générez autant d'idées que vous le souhaitez avec Gemini
              </ThemedText>
            </View>
          </View>

          <Spacer height={Spacing.md} />

          <View style={styles.faqItem}>
            <View
              style={[
                styles.faqIcon,
                { backgroundColor: Colors.light.primary + "20" },
              ]}
            >
              <Feather
                name="bar-chart-2"
                size={16}
                color={Colors.light.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.faqItemTitle}>
                Analyses avancées
              </ThemedText>
              <ThemedText style={styles.faqItemText}>
                Suivez vos performances et optimisez vos vidéos
              </ThemedText>
            </View>
          </View>
        </View>

        <Spacer height={Spacing.xl} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  headerContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  planCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  badgeContainer: {
    position: "absolute",
    top: -12,
    right: Spacing.lg,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "white",
  },
  planName: {
    fontSize: 18,
    fontWeight: "600",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 32,
    fontWeight: "700",
  },
  period: {
    fontSize: 14,
    marginLeft: Spacing.sm,
    opacity: 0.6,
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    opacity: 0.5,
    marginRight: Spacing.sm,
  },
  discountBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    fontSize: 11,
    fontWeight: "600",
  },
  description: {
    fontSize: 13,
    opacity: 0.7,
  },
  featuresList: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    marginRight: Spacing.md,
  },
  featureText: {
    fontSize: 13,
    flex: 1,
  },
  selectButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  selectButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  infoBanner: {
    flexDirection: "row",
    backgroundColor: Colors.light.primary + "10",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "flex-start",
  },
  infoBannerIcon: {
    marginRight: Spacing.md,
    marginTop: 2,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontWeight: "600",
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  infoBannerText: {
    fontSize: 12,
    opacity: 0.7,
  },
  faqSection: {
    marginTop: Spacing.xl,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  faqItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  faqIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
    marginTop: 2,
  },
  faqItemTitle: {
    fontWeight: "600",
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  faqItemText: {
    fontSize: 12,
    opacity: 0.7,
  },
  freeVersionCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  freeVersionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
    marginTop: 2,
  },
  freeVersionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  freeVersionText: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: Spacing.xs,
  },
  freeVersionSubtext: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
  promoInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    fontWeight: "500",
  },
  promoButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
});
