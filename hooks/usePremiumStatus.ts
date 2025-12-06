import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { PremiumService, type PremiumStatus } from "@/utils/premiumService";

export function usePremiumStatus() {
  const [status, setStatus] = useState<PremiumStatus>({
    tier: "free",
    planId: null,
    subscriptionDate: null,
    expiryDate: null,
  });
  const [loading, setLoading] = useState(true);

  const refreshStatus = useCallback(async () => {
    try {
      const premiumStatus = await PremiumService.getPremiumStatus();
      setStatus(premiumStatus);
    } catch (error) {
      console.error("Erreur lors de la lecture du statut premium:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Rafraîchir le statut à chaque fois qu'on focus l'écran
  useFocusEffect(
    useCallback(() => {
      refreshStatus();
    }, [refreshStatus])
  );

  return { ...status, loading, refreshStatus };
}
