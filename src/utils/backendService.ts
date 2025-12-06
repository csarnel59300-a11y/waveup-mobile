// Backend service - connects to Vercel functions
// ⚠️ IMPORTANT: After Vercel deployment, update EXPO_PUBLIC_BACKEND_URL in .env.local
// Example: EXPO_PUBLIC_BACKEND_URL=https://waveup-backend-abc123.vercel.app

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

// Check if backend is configured
export const isBackendConfigured = (): boolean => {
  return BACKEND_URL.length > 0 && BACKEND_URL.includes('.vercel.app');
};

export interface BackendIdea {
  idea: string;
  hashtags: string[];
  timing: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedReach: string;
}

/**
 * Get TikTok OAuth authorization URL
 */
export async function getOAuthAuthorizationUrl(): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/authorize`);
    const data = await response.json();
    return data.authUrl;
  } catch (error) {
    console.error('Failed to get OAuth URL:', error);
    throw error;
  }
}

/**
 * Handle OAuth callback and get access token
 */
export async function handleOAuthCallback(code: string): Promise<any> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/callback?code=${code}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to handle OAuth callback:', error);
    throw error;
  }
}

/**
 * Generate content idea using Gemini AI
 */
export async function generateContentIdea(
  userId: string,
  contentType?: string,
  recentTrends?: string[]
): Promise<BackendIdea> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ideas/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        contentType,
        recentTrends,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.idea;
  } catch (error) {
    console.error('Failed to generate idea:', error);
    throw error;
  }
}

/**
 * Generate TikTok bio using Gemini AI
 */
export async function generateBio(
  tiktokUsername: string,
  niche?: string
): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/générerBio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tiktokUsername,
        niche,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.bio || '';
  } catch (error) {
    console.error('Failed to generate bio:', error);
    throw error;
  }
}

/**
 * Generate TikTok comment using Gemini AI
 */
export async function generateComment(
  videoContent: string,
  tone?: 'friendly' | 'funny' | 'engaging'
): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/générerCommentaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoContent,
        tone,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.comment || '';
  } catch (error) {
    console.error('Failed to generate comment:', error);
    throw error;
  }
}

/**
 * Generate DM reply using Gemini AI
 */
export async function generateDMReply(
  dmContent: string,
  context?: string
): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/générerRéponse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dmContent,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.reply || '';
  } catch (error) {
    console.error('Failed to generate DM reply:', error);
    throw error;
  }
}

/**
 * Check if backend is reachable
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
