import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const BACKEND_URL = "https://waveup.vercel.app";
const TOKEN_STORAGE_KEY = "tiktok_token";
const USER_STORAGE_KEY = "tiktok_user";
const OPEN_ID_STORAGE_KEY = "tiktok_open_id";

export interface TikTokTokenData {
  userId: string;
  accessToken: string;
  openId: string;
  refreshToken?: string;
}

export interface TikTokUser {
  username: string;
  followerCount: number;
  videoCount: number;
  heartCount: number;
}

export const tiktokOAuthService = {
  // Start OAuth flow
  initiateLogin: async (): Promise<TikTokTokenData | null> => {
    try {
      if (Platform.OS === "web") {
        // Web: redirect to authorize endpoint
        const authUrl = `${BACKEND_URL}/api/auth/authorize`;
        window.location.href = authUrl;
        return null;
      } else {
        // Mobile: open in browser
        const authUrl = `${BACKEND_URL}/api/auth/authorize`;
        
        const result = await WebBrowser.openBrowserAsync(authUrl);

        if (result.type === "cancel") {
          throw new Error("OAuth cancelled");
        }

        // Extract token from result
        // Note: In production, you'd use deep linking to capture the callback
        return null;
      }
    } catch (error) {
      console.error("OAuth initiation error:", error);
      throw error;
    }
  },

  // Handle callback from TikTok OAuth
  handleCallback: async (code: string): Promise<TikTokTokenData> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/callback?code=${code}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to exchange code");
      }

      const tokenData = await response.json() as TikTokTokenData;

          // Store tokens
      if (Platform.OS !== "web") {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, tokenData.accessToken);
        await AsyncStorage.setItem(OPEN_ID_STORAGE_KEY, tokenData.openId);
        if (tokenData.refreshToken) {
          await AsyncStorage.setItem("tiktok_refresh_token", tokenData.refreshToken);
        }
      } else {
        localStorage.setItem(TOKEN_STORAGE_KEY, tokenData.accessToken);
        localStorage.setItem(OPEN_ID_STORAGE_KEY, tokenData.openId);
      }

      await AsyncStorage.setItem("tiktok_user_id", tokenData.userId);

      return tokenData;
    } catch (error) {
      console.error("OAuth callback error:", error);
      throw error;
    }
  },

  // Get stored token
  getStoredToken: async (): Promise<string | null> => {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(TOKEN_STORAGE_KEY);
      }
      return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  // Get stored open ID
  getStoredOpenId: async (): Promise<string | null> => {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(OPEN_ID_STORAGE_KEY);
      }
      return await AsyncStorage.getItem(OPEN_ID_STORAGE_KEY);
    } catch (error) {
      console.error("Error getting open ID:", error);
      return null;
    }
  },

  // Get stored user ID
  getStoredUserId: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem("tiktok_user_id");
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  },

  // Check if user is logged in
  isLoggedIn: async (): Promise<boolean> => {
    const token = await tiktokOAuthService.getStoredToken();
    return !!token;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(OPEN_ID_STORAGE_KEY);
      } else {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        await AsyncStorage.removeItem(OPEN_ID_STORAGE_KEY);
        await AsyncStorage.removeItem("tiktok_refresh_token");
      }
      await AsyncStorage.removeItem("tiktok_user_id");
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  },
};
