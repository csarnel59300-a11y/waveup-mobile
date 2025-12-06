// Authentication service for WaveUp
// Manages user authentication state and sessions

import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebaseService, type FirebaseUser } from "./firebaseService";

const AUTH_STORAGE_KEY = "waveup_auth_user";
const SESSION_STORAGE_KEY = "waveup_session_token";

export const authService = {
  // Store user in local storage
  storeUser: async (user: FirebaseUser) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return true;
    } catch (error) {
      console.error("Error storing user:", error);
      return false;
    }
  },

  // Get stored user
  getStoredUser: async (): Promise<FirebaseUser | null> => {
    try {
      const data = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting stored user:", error);
      return null;
    }
  },

  // Store session token
  storeSession: async (token: string) => {
    try {
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, token);
      return true;
    } catch (error) {
      console.error("Error storing session:", error);
      return false;
    }
  },

  // Get session token
  getSession: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  },

  // Sign up
  signUp: async (email: string, password: string, displayName: string) => {
    try {
      const { user, error } = await firebaseService.signUp(
        email,
        password,
        displayName
      );
      if (error || !user) {
        return { user: null, error: error || "Sign up failed" };
      }
      await authService.storeUser(user);
      return { user, error: null };
    } catch (error) {
      return { user: null, error: String(error) };
    }
  },

  // Sign in
  signIn: async (email: string, password: string) => {
    try {
      const { user, error } = await firebaseService.signIn(email, password);
      if (error || !user) {
        return { user: null, error: error || "Sign in failed" };
      }
      await authService.storeUser(user);
      return { user, error: null };
    } catch (error) {
      return { user: null, error: String(error) };
    }
  },

  // Restore session
  restoreSession: async (): Promise<FirebaseUser | null> => {
    try {
      const user = await authService.getStoredUser();
      return user;
    } catch (error) {
      console.error("Error restoring session:", error);
      return null;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await firebaseService.signOut();
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      return false;
    }
  },
};
