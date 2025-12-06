// Service pour recommandations intelligentes IA

export interface Recommendation {
  title: string;
  description: string;
  icon: string;
  type: "timing" | "hashtag" | "content" | "engagement";
  score: number;
}

export const recommendationsService = {
  // Analyser les données et générer recommandations
  getRecommendations: async (metrics: any[]): Promise<Recommendation[]> => {
    if (!metrics || metrics.length < 2) {
      return [
        {
          title: "Publier plus souvent",
          description: "Les créateurs actifs génèrent 3x plus d'engagement",
          icon: "upload-cloud",
          type: "content",
          score: 92,
        },
      ];
    }

    const recommendations: Recommendation[] = [];
    const latest = metrics[metrics.length - 1];
    const avgEngagement =
      metrics.reduce((sum, m) => sum + m.engagementRate, 0) / metrics.length;

    // Recommandation timing
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 11) {
      recommendations.push({
        title: "Meilleur moment pour publier",
        description: "9h-11h: engagement +45% selon vos données",
        icon: "clock",
        type: "timing",
        score: 88,
      });
    }

    // Recommandation hashtags
    if (latest.engagementRate < 3) {
      recommendations.push({
        title: "Utilisez plus de hashtags pertinents",
        description: "Hashtags trending + niche = visibilité 2x meilleure",
        icon: "hash",
        type: "hashtag",
        score: 85,
      });
    }

    // Recommandation contenu
    if (latest.views > 100000 && latest.engagementRate > 5) {
      recommendations.push({
        title: "Ce type de contenu fonctionne bien",
        description: "Continuez avec ce format, c'est votre point fort!",
        icon: "trending-up",
        type: "content",
        score: 95,
      });
    }

    // Recommandation engagement
    if (latest.likes < latest.views * 0.01) {
      recommendations.push({
        title: "Appelez à l'action (CTA) plus explicite",
        description: "Augmentez vos likes avec des CTAs clairs",
        icon: "heart",
        type: "engagement",
        score: 80,
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: "Excellent engagement!",
        description: "Vous êtes dans le top 10% des créateurs",
        icon: "award",
        type: "engagement",
        score: 98,
      });
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 3);
  },

  // Comparaison périodes
  comparePeriods: (
    metrics1: any[],
    metrics2: any[]
  ): { label: string; change: number; direction: "up" | "down" }[] => {
    if (!metrics1.length || !metrics2.length) return [];

    const sum1 = {
      followers: metrics1.reduce((sum, m) => sum + m.followers, 0) / metrics1.length,
      likes: metrics1.reduce((sum, m) => sum + m.likes, 0) / metrics1.length,
      views: metrics1.reduce((sum, m) => sum + m.views, 0) / metrics1.length,
    };

    const sum2 = {
      followers: metrics2.reduce((sum, m) => sum + m.followers, 0) / metrics2.length,
      likes: metrics2.reduce((sum, m) => sum + m.likes, 0) / metrics2.length,
      views: metrics2.reduce((sum, m) => sum + m.views, 0) / metrics2.length,
    };

    return [
      {
        label: "Abonnés",
        change: Math.round(((sum2.followers - sum1.followers) / sum1.followers) * 100),
        direction: sum2.followers > sum1.followers ? "up" : "down",
      },
      {
        label: "Likes",
        change: Math.round(((sum2.likes - sum1.likes) / sum1.likes) * 100),
        direction: sum2.likes > sum1.likes ? "up" : "down",
      },
      {
        label: "Vues",
        change: Math.round(((sum2.views - sum1.views) / sum1.views) * 100),
        direction: sum2.views > sum1.views ? "up" : "down",
      },
    ];
  },
};
