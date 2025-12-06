import { shouldSync, saveSyncData, getCachedData } from "./syncService";

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface DailyPlan {
  date: string;
  ideas: DailyIdea[];
  trendingHashtags: string[];
  bestPostingTime: string;
  syncedAt: number;
}

export interface DailyIdea {
  id: string;
  title: string;
  description: string;
  hashtags: string[];
  estimatedViews: string;
  postingTime: string;
  category: string;
}

export async function generateDailyPlan(forceRefresh: boolean = false): Promise<DailyPlan> {
  if (!API_KEY) {
    throw new Error("Clé API Gemini non configurée");
  }

  // Vérifier si on doit synchroniser
  const needsSync = forceRefresh || (await shouldSync("daily_plan"));
  
  if (!needsSync) {
    const cached = await getCachedData("daily_plan");
    if (cached) {
      console.log("Utilisation du cache pour le plan quotidien");
      return cached;
    }
  }

  const today = new Date().toLocaleDateString("fr-FR");
  const now = new Date();
  const hour = now.getHours();
  
  const prompt = `Tu es un expert en tendances TikTok et création de contenu viral avec un accès aux données actuelles de ${today} à ${hour}h.

IMPORTANT: Tu dois utiliser tes connaissances actuelles pour identifier les VRAIS hashtags et tendances TikTok du moment.

Génère un plan QUOTIDIEN OPTIMISÉ pour un créateur TikTok avec:
1. Exactement 3 idées de vidéos pour aujourd'hui (espacées de 8 heures)
2. Les 10 hashtags ACTUELLEMENT TENDANCES sur TikTok (vrais hashtags viraux maintenant)
3. Les meilleurs horaires de publication

Les hashtags doivent être réels, populaires et ACTUELS sur TikTok. Exemples de vrais hashtags: #FYP, #ForYouPage, #Viral, #Trending, #MustWatch, #TikTokViral, #Aesthetic, etc.

Réponds UNIQUEMENT avec ce JSON valide, sans markdown:
{
  "date": "${today}",
  "trendingHashtags": ["#FYP", "#ForYouPage", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8", "#tag9", "#tag10"],
  "bestPostingTime": "14h-16h",
  "ideas": [
    {
      "id": "1",
      "title": "Titre créatif vidéo 1",
      "description": "Description détaillée et inspirante",
      "postingTime": "08h00",
      "category": "dance|music|comedy|tutorial|vlog|trend",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "estimatedViews": "50K-100K"
    },
    {
      "id": "2",
      "title": "Titre créatif vidéo 2",
      "description": "Description détaillée et inspirante",
      "postingTime": "16h00",
      "category": "dance|music|comedy|tutorial|vlog|trend",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "estimatedViews": "100K-200K"
    },
    {
      "id": "3",
      "title": "Titre créatif vidéo 3",
      "description": "Description détaillée et inspirante",
      "postingTime": "21h00",
      "category": "dance|music|comedy|tutorial|vlog|trend",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "estimatedViews": "150K-300K"
    }
  ]
}

IMPORTANT: Utilise les VRAIS hashtags tendances du moment, pas des exemples génériques.
RÉPONDS UNIQUEMENT AVEC LE JSON VALIDE, RIEN D'AUTRE.`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 2000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Erreur Gemini API:", error);
      throw new Error(`Erreur Gemini: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("Réponse Gemini vide");
    }

    // Extraire le JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Impossible de parser la réponse Gemini");
    }

    const plan = JSON.parse(jsonMatch[0]) as DailyPlan;
    
    // Ajouter timestamp de synchronisation
    const planWithSync: DailyPlan = {
      ...plan,
      syncedAt: Date.now(),
    };
    
    // Sauvegarder en cache
    await saveSyncData("daily_plan", planWithSync, "gemini");
    
    return planWithSync;
  } catch (error) {
    console.error("Erreur lors de la génération du plan quotidien:", error);
    throw error;
  }
}

// Plan par défaut si Gemini ne répond pas
export const defaultDailyPlan: DailyPlan = {
  date: new Date().toLocaleDateString("fr-FR"),
  syncedAt: Date.now(),
  trendingHashtags: [
    "#FYP",
    "#ForYouPage",
    "#TikTokViral",
    "#Trending",
    "#MustWatch",
    "#Viral2024",
    "#ContentCreator",
    "#TikTokChallenge",
    "#Aesthetic",
    "#Vibes",
  ],
  bestPostingTime: "14h-16h",
  ideas: [
    {
      id: "1",
      title: "Transition tendance du moment",
      description:
        "Utilisez la transition virale du moment avec un son très tendance. Montrez un changement radical en 3 secondes.",
      postingTime: "08h00",
      category: "trend",
      hashtags: ["#Transition", "#FYP", "#Viral"],
      estimatedViews: "100K-200K",
    },
    {
      id: "2",
      title: "Challenge humoristique tendance",
      description:
        "Participez au challenge humoristique qui cartonne actuellement. Mettez votre propre touche créative.",
      postingTime: "16h00",
      category: "comedy",
      hashtags: ["#Challenge", "#Humour", "#TikTokViral"],
      estimatedViews: "150K-300K",
    },
    {
      id: "3",
      title: "Contenu relationnel tardif",
      description:
        "Postez un contenu relationnel drôle le soir pour l'engagement tardif. Cible l'audience nocturne.",
      postingTime: "21h30",
      category: "vlog",
      hashtags: ["#MustWatch", "#Aesthetic", "#Vibes"],
      estimatedViews: "80K-150K",
    },
  ],
};
