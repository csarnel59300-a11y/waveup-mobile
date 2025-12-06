import axios from 'axios';
import { TikTokTokenResponse, TikTokUserData } from '../types/index.js';

const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v1/oauth/authorize';
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v1/oauth/token';
const TIKTOK_USER_INFO_URL = 'https://open.tiktokapis.com/v1/user/info/';

export class TikTokAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  /**
   * Generate TikTok OAuth authorization URL
   */
  generateAuthUrl(state: string, scope: string[] = ['user.info.basic']): string {
    const params = new URLSearchParams({
      client_key: this.clientId,
      response_type: 'code',
      scope: scope.join(','),
      redirect_uri: this.redirectUri,
      state: state,
    });

    return `${TIKTOK_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<TikTokTokenResponse> {
    try {
      const response = await axios.post<TikTokTokenResponse>(TIKTOK_TOKEN_URL, {
        client_key: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      });

      return response.data;
    } catch (error) {
      console.error('TikTok token exchange error:', error);
      throw new Error('Failed to exchange code for token');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TikTokTokenResponse> {
    try {
      const response = await axios.post<TikTokTokenResponse>(TIKTOK_TOKEN_URL, {
        client_key: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      return response.data;
    } catch (error) {
      console.error('TikTok token refresh error:', error);
      throw new Error('Failed to refresh token');
    }
  }

  /**
   * Get user info from TikTok
   */
  async getUserInfo(accessToken: string, openId: string): Promise<TikTokUserData> {
    try {
      const params = new URLSearchParams({
        access_token: accessToken,
        open_id: openId,
        fields: 'open_id,union_id,avatar,username,video_count,follower_count,following_count,heart_count',
      });

      const response = await axios.get<{ data: TikTokUserData }>(
        `${TIKTOK_USER_INFO_URL}?${params.toString()}`
      );

      return response.data.data;
    } catch (error) {
      console.error('TikTok user info error:', error);
      throw new Error('Failed to fetch user info');
    }
  }
}
