const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface ContentIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  hashtags: string[];
  difficulty: string;
  estimatedViews: string;
}

export async function generateVideoCaption(topic: string, style: string = "engageant"): Promise<string> {
  if (!API_KEY) {
    throw new Error("Clé API Gemini non configurée");
  }

  const prompt = `Tu es un expert en contenu viral TikTok. Génère une légende (caption) courte, accrocheuse et engageante pour une vidéo TikTok sur le sujet: "${topic}" avec un ton ${style}.

La légende doit:
- Être courte (max 150 caractères)
- Inclure un appel à l'action
- Être engageante et mémorable
- Être en français

Réponds UNIQUEMENT avec la légende, rien d'autre.`;

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
          temperature: 0.9,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur Gemini: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("Réponse Gemini vide");
    }

    return content.trim();
  } catch (error) {
    console.error("Erreur lors de la génération de légende:", error);
    throw error;
  }
}

export async function generateVideoScript(topic: string, duration: string = "60s"): Promise<string> {
  if (!API_KEY) {
    throw new Error("Clé API Gemini non configurée");
  }

  const prompt = `Tu es un expert en scénarisation de vidéos TikTok. Génère un script court pour une vidéo TikTok d'environ ${duration} sur le sujet: "${topic}".

Le script doit:
- Être adapté à la durée (${duration})
- Avoir un crochet accrocheur au début (3 premières secondes)
- Inclure des indications de voix/ton entre [crochets]
- Être en français
- Être facilement jouable par un créateur solo

Format:
[Ton accrocheur] Ouverture de 3s
[Ton normal] Corps du script
[Ton énergique] CTA final

Réponds UNIQUEMENT avec le script, rien d'autre.`;

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
          temperature: 0.8,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur Gemini: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("Réponse Gemini vide");
    }

    return content.trim();
  } catch (error) {
    console.error("Erreur lors de la génération de script:", error);
    throw error;
  }
}

export async function generateContentIdeas(userNiche: string = "TikTok général"): Promise<ContentIdea[]> {
  if (!API_KEY) {
    throw new Error("Clé API Gemini non configurée");
  }

  const prompt = `Tu es un expert en création de contenu TikTok. Génère 5 idées de vidéos TikTok créatives et engageantes pour quelqu'un qui crée du contenu dans la niche: "${userNiche}".

Pour chaque idée, fournis une réponse JSON valide avec exactement cette structure (sans markdown, juste le JSON):
[
  {
    "id": "1",
    "title": "Titre de l'idée",
    "description": "Description détaillée de ce qu'il faut faire",
    "category": "music|dance|comedy|tutorial|vlog|all",
    "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
    "difficulty": "Facile|Moyen|Difficile",
    "estimatedViews": "50K-100K"
  }
]

Assure-toi que:
- Les idées sont créatives et tendances
- Les descriptions sont en français
- Les hashtags sont pertinents
- L'estimatedViews est réaliste
- La réponse est UN SEUL objet JSON valide, parseable

IMPORTANT: Réponds UNIQUEMENT avec le JSON valide, rien d'autre.`;

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
          temperature: 0.8,
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

    // Nettoyer la réponse pour extraire le JSON
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Impossible de parser la réponse Gemini");
    }

    const ideas = JSON.parse(jsonMatch[0]) as ContentIdea[];
    
    // S'assurer que chaque idée a un ID unique
    return ideas.map((idea, index) => ({
      ...idea,
      id: String(index + 1),
    }));
  } catch (error) {
    console.error("Erreur lors de la génération d'idées:", error);
    throw error;
  }
}
