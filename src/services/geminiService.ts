import { GoogleGenerativeAI } from '@google/generative-ai';
import { IdeaGenerationRequest, IdeaGenerationResponse } from '../types/index.js';

export class GeminiService {
  private client: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Generate TikTok content ideas using Gemini AI
   */
  async generateIdea(request: IdeaGenerationRequest): Promise<IdeaGenerationResponse> {
    try {
      const prompt = this.buildPrompt(request);

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      return this.parseResponse(responseText);
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw new Error('Failed to generate idea');
    }
  }

  /**
   * Build prompt for Gemini
   */
  private buildPrompt(request: IdeaGenerationRequest): string {
    return `Tu es un expert TikTok creator coach. Génère une idée de contenu créative et engageante pour ${request.tiktokUsername}.

Contexte:
- Username TikTok: ${request.tiktokUsername}
- Type de contenu préféré: ${request.contentType || 'Tous les types'}
- Tendances récentes: ${request.recentTrends?.join(', ') || 'Généralistes'}

Réponds UNIQUEMENT en JSON avec cette structure (pas de markdown, pas d'explication):
{
  "idea": "Description courte et créative de l'idée",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4"],
  "timing": "Heure optimale de publication (ex: 18h30-20h)",
  "difficulty": "easy|medium|hard",
  "expectedReach": "Estimation du nombre de vues potentielles"
}`;
  }

  /**
   * Parse Gemini response
   */
  private parseResponse(text: string): IdeaGenerationResponse {
    try {
      // Clean up markdown code blocks if present
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.slice(7);
      }
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.slice(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.slice(0, -3);
      }

      const parsed = JSON.parse(cleanText.trim());

      return {
        idea: parsed.idea,
        hashtags: parsed.hashtags,
        timing: parsed.timing,
        difficulty: parsed.difficulty,
        expectedReach: parsed.expectedReach,
      };
    } catch (error) {
      console.error('Response parsing error:', error, 'Text:', text);
      throw new Error('Failed to parse Gemini response');
    }
  }
}
