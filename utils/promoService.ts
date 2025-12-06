// Service de gestion des codes promo

export interface PromoCode {
  code: string;
  discountPercent: number;
  maxUses: number;
  currentUses: number;
  expiryDate: string;
  isActive: boolean;
}

export const promoCodes: PromoCode[] = [
  {
    code: "NOEL50",
    discountPercent: 50,
    maxUses: 100,
    currentUses: 0,
    expiryDate: "2025-12-31",
    isActive: true,
  },
  {
    code: "WAVEUP20",
    discountPercent: 20,
    maxUses: 999,
    currentUses: 0,
    expiryDate: "2025-12-31",
    isActive: true,
  },
  {
    code: "NEWCREATOR30",
    discountPercent: 30,
    maxUses: 500,
    currentUses: 0,
    expiryDate: "2025-12-31",
    isActive: true,
  },
];

export function validatePromoCode(code: string): { valid: boolean; discount: number; message: string } {
  const normalizedCode = code.toUpperCase().trim();
  const promo = promoCodes.find(p => p.code === normalizedCode);

  if (!promo) {
    return { valid: false, discount: 0, message: "Code promo invalide" };
  }

  if (!promo.isActive) {
    return { valid: false, discount: 0, message: "Code promo désactivé" };
  }

  const today = new Date().toISOString().split("T")[0];
  if (today > promo.expiryDate) {
    return { valid: false, discount: 0, message: "Code promo expiré" };
  }

  if (promo.currentUses >= promo.maxUses) {
    return { valid: false, discount: 0, message: "Code promo épuisé" };
  }

  return { valid: true, discount: promo.discountPercent, message: `Code valide! -${promo.discountPercent}% appliqué` };
}

export function applyPromoCode(originalPrice: number, discountPercent: number): number {
  const discount = (originalPrice * discountPercent) / 100;
  return Math.round((originalPrice - discount) * 100) / 100;
}
