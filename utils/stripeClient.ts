// Service Stripe pour WaveUp (Frontend Expo)
// Utilise @stripe/stripe-react-native pour gérer les paiements
// https://github.com/stripe/stripe-react-native
// NOTE: @stripe/stripe-react-native est une lib native seulement (pas de web support)

import { Platform } from "react-native";

// Stripe SDK uniquement sur mobile/native
let initStripe: any = null;
if (Platform.OS !== "web") {
  const stripeModule = require("@stripe/stripe-react-native");
  initStripe = stripeModule.initStripe;
}

// Note: Les clés Stripe sont stockées comme secrets Replit (STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY)
// La clé publique est accessible via process.env.STRIPE_PUBLISHABLE_KEY en runtime

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

export async function initializeStripe(): Promise<boolean> {
  // Stripe SDK n'existe que sur mobile (iOS/Android)
  if (Platform.OS === "web") {
    console.log("ℹ️ Stripe SDK indisponible sur web");
    return false;
  }

  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn("⚠️ STRIPE_PUBLISHABLE_KEY non configuré");
    return false;
  }

  if (!initStripe) {
    console.warn("⚠️ initStripe non disponible sur cette plateforme");
    return false;
  }

  try {
    await initStripe({
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: "WaveUp",
    });
    console.log("✅ Stripe initialisé avec succès");
    return true;
  } catch (error) {
    console.error("❌ Erreur initialisation Stripe:", error);
    return false;
  }
}

export function getStripePublishableKey(): string {
  return STRIPE_PUBLISHABLE_KEY;
}

export const stripeConfig = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  merchantId: "WaveUp",
  // TODO: Ajouter les plan IDs en production une fois les produits Stripe créés
};
