import * as admin from 'firebase-admin';
import { User, TikTokTokenResponse } from '../types/index.js';

export class FirebaseService {
  private db: admin.firestore.Firestore;

  constructor() {
    if (!admin.apps.length) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    }

    this.db = admin.firestore();
  }

  /**
   * Save or update user with tokens
   */
  async saveUserTokens(userId: string, tiktokData: any, tokenData: TikTokTokenResponse): Promise<void> {
    const user: User = {
      id: userId,
      tiktokId: tokenData.open_id,
      tiktokUsername: tiktokData.username,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiry: Date.now() + tokenData.expires_in * 1000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      plan: 'free',
      ideasUsedToday: 0,
    };

    await this.db.collection('users').doc(userId).set(user, { merge: true });
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User | null> {
    const doc = await this.db.collection('users').doc(userId).get();
    return doc.exists ? (doc.data() as User) : null;
  }

  /**
   * Update refresh token
   */
  async updateRefreshToken(userId: string, tokenData: TikTokTokenResponse): Promise<void> {
    await this.db.collection('users').doc(userId).update({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiry: Date.now() + tokenData.expires_in * 1000,
      updatedAt: Date.now(),
    });
  }

  /**
   * Check if token is expired
   */
  async isTokenExpired(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return true;
    return user.tokenExpiry < Date.now();
  }

  /**
   * Increment ideas used today
   */
  async incrementIdeasUsed(userId: string): Promise<void> {
    await this.db.collection('users').doc(userId).update({
      ideasUsedToday: admin.firestore.FieldValue.increment(1),
    });
  }

  /**
   * Reset ideas used (daily job)
   */
  async resetDailyIdeas(): Promise<void> {
    const snapshot = await this.db.collection('users').get();
    const batch = this.db.batch();

    snapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      batch.update(doc.ref, { ideasUsedToday: 0 });
    });

    await batch.commit();
  }
}
