import AsyncStorage from "@react-native-async-storage/async-storage";

const PREMIUM_KEY = "waveup_premium_status";
const SUBSCRIPTION_KEY = "waveup_subscription";

export interface PremiumStatus {
  tier: "free" | "monthly" | "annual" | "pro";
  planId: "monthly" | "annual" | "pro" | null;
  subscriptionDate: string | null;
  expiryDate: string | null;
}

const DEFAULT_STATUS: PremiumStatus = {
  tier: "free",
  planId: null,
  subscriptionDate: null,
  expiryDate: null,
};

// Les utilisateurs commencent en gratuit
export const getTierLabel = (tier: string): string => {
  if (tier === "monthly") return "mensuel";
  if (tier === "annual") return "annuel";
  return "gratuit";
};

// Limites quotidiennes par tier
export const maxIdeasPerDay = {
  free: 3,
  monthly: 5,
  annual: 10,
  pro: 999, // illimité (999 = plafond pratique)
};

export const getDailyLimit = (tier: "free" | "monthly" | "annual" | "pro"): number => {
  return maxIdeasPerDay[tier] || maxIdeasPerDay.free;
};

interface IdeasUsageTracker {
  date: string;
  count: number;
}

export class PremiumService {
  static async getPremiumStatus(): Promise<PremiumStatus> {
    try {
      const stored = await AsyncStorage.getItem(PREMIUM_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_STATUS;
    } catch (error) {
      console.error("Erreur lors de la lecture du statut premium:", error);
      return DEFAULT_STATUS;
    }
  }

  static async getIdeasUsedToday(): Promise<number> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const stored = await AsyncStorage.getItem("waveup_ideas_used");
      if (!stored) return 0;

      const tracker: IdeasUsageTracker = JSON.parse(stored);
      if (tracker.date === today) {
        return tracker.count;
      }
      return 0;
    } catch (error) {
      console.error("Erreur lors de la lecture des idées utilisées:", error);
      return 0;
    }
  }

  static async recordIdeasUsed(): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const currentUsed = await this.getIdeasUsedToday();
      const tracker: IdeasUsageTracker = {
        date: today,
        count: currentUsed + 1,
      };
      await AsyncStorage.setItem("waveup_ideas_used", JSON.stringify(tracker));
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des idées utilisées:", error);
    }
  }

  static async setPremium(planId: "monthly" | "annual" | "pro"): Promise<void> {
    try {
      const now = new Date();
      const expiryDate = new Date(now);

      if (planId === "monthly") {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (planId === "annual") {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else if (planId === "pro") {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      }

      const status: PremiumStatus = {
        tier: planId,
        planId,
        subscriptionDate: now.toISOString(),
        expiryDate: expiryDate.toISOString(),
      };

      await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify(status));
    } catch (error) {
      console.error("Erreur lors de la définition du statut premium:", error);
      throw error;
    }
  }

  static async removePremium(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREMIUM_KEY);
    } catch (error) {
      console.error("Erreur lors de la suppression du statut premium:", error);
      throw error;
    }
  }

  static async isPremium(): Promise<boolean> {
    const status = await this.getPremiumStatus();
    return status.tier !== "free";
  }

  static async getRemainingDays(): Promise<number> {
    const status = await this.getPremiumStatus();
    if (status.tier === "free" || !status.expiryDate) return 0;

    const expiryDate = new Date(status.expiryDate);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }
}
