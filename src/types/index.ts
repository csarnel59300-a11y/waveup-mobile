export interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  open_id: string;
}

export interface TikTokUserData {
  open_id: string;
  union_id?: string;
  username: string;
  avatar: string;
  video_count?: number;
  follower_count?: number;
  following_count?: number;
  heart_count?: number;
}

export interface IdeaGenerationRequest {
  userId: string;
  tiktokUsername: string;
  recentTrends?: string[];
  contentType?: string;
}

export interface IdeaGenerationResponse {
  idea: string;
  hashtags: string[];
  timing: string;
  difficulty: "easy" | "medium" | "hard";
  expectedReach: string;
}

export interface User {
  id: string;
  tiktokId: string;
  email?: string;
  tiktokUsername: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
  createdAt: number;
  updatedAt: number;
  plan: "free" | "premium_monthly" | "premium_annual" | "pro";
  ideasUsedToday: number;
}
