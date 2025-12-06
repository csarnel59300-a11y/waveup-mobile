// Service de gestion des paiements pour les abonnements WaveUp+

export interface SubscriptionPlan {
  id: string;
  name: string;
  period: "monthly" | "annual";
  price: number;
  originalPrice?: number;
  features: string[];
  description: string;
  badge?: string;
  secondaryBadge?: string;
  stripeId: string;
  gumroadId: string;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "monthly",
    name: "WaveUp+ Mensuel",
    period: "monthly",
    price: 4.99,
    features: [
      "5 idées IA par jour",
      "Hashtags tendances en temps réel",
      "Suggestions optimisées",
      "Synchronisation 24/7",
      "Support standard",
    ],
    description: "Accès complet pendant 1 mois",
    stripeId: "price_monthly_waveup_plus",
    gumroadId: "monthly-subscription",
  },
  {
    id: "annual",
    name: "WaveUp+ Annuel",
    period: "annual",
    price: 49.99,
    originalPrice: 59.88,
    features: [
      "10 idées IA par jour",
      "Hashtags tendances en temps réel",
      "Suggestions avancées",
      "Synchronisation 24/7",
      "Support prioritaire",
      "Accès bêta aux nouvelles fonctionnalités",
    ],
    description: "1 an d'accès complet + 1 mois offert",
    badge: "1 MOIS OFFERT",
    stripeId: "price_annual_waveup_plus",
    gumroadId: "annual-subscription",
  },
  {
    id: "pro",
    name: "WaveUp Pro",
    period: "monthly",
    price: 20,
    features: [
      "Idées IA illimitées par jour",
      "Hashtags tendances en temps réel",
      "Analytics complètes de vos vidéos",
      "Export de planning & publication directe",
      "Accès anticipé aux nouvelles features",
      "Support VIP 24/7",
      "Suggestions de formats innovants",
      "Optimisation automatique des hashtags",
    ],
    description: "Pour les créateurs professionnels",
    badge: "POUR MICRO-CRÉATEURS",
    secondaryBadge: "POUR INFLUENCEURS",
    stripeId: "price_pro_waveup",
    gumroadId: "pro-subscription",
  },
];

export function getSubscriptionDiscount(plan: SubscriptionPlan): number | null {
  if (!plan.originalPrice) return null;
  const discount = plan.originalPrice - plan.price;
  const percentage = Math.round((discount / plan.originalPrice) * 100);
  return percentage;
}

export async function initializePayment(
  planId: string,
  paymentMethod: "stripe" | "gumroad"
) {
  const plan = subscriptionPlans.find((p) => p.id === planId);
  if (!plan) throw new Error("Plan non trouvé");

  // Stripe payment initialization
  // En production: utiliser le backend pour créer une PaymentIntent
  // En MVP: simuler le paiement avec success/error flow
  console.log(`Initialisation paiement ${plan.name} via ${paymentMethod}`);
  
  // Pour maintenant: retourner plan + method pour UI
  return {
    success: true,
    plan,
    method: paymentMethod,
  };
}

export async function verifySubscription(
  subscriptionId: string
): Promise<boolean> {
  // TODO: Vérifier l'abonnement via API backend
  console.log("Vérification abonnement:", subscriptionId);
  return false;
}
