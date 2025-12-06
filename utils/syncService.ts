import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SyncData {
  timestamp: number;
  data: any;
  source: string;
}

const SYNC_INTERVAL = 6 * 60 * 60 * 1000; // 6 heures
const CACHE_KEY = "waveup_sync_cache";

export async function shouldSync(key: string): Promise<boolean> {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_KEY}_${key}`);
    if (!cached) return true;

    const syncData: SyncData = JSON.parse(cached);
    const now = Date.now();
    const timeDiff = now - syncData.timestamp;

    return timeDiff > SYNC_INTERVAL;
  } catch (error) {
    console.error("Erreur lors de la vérification sync:", error);
    return true;
  }
}

export async function saveSyncData(
  key: string,
  data: any,
  source: string = "gemini"
): Promise<void> {
  try {
    const syncData: SyncData = {
      timestamp: Date.now(),
      data,
      source,
    };
    await AsyncStorage.setItem(
      `${CACHE_KEY}_${key}`,
      JSON.stringify(syncData)
    );
  } catch (error) {
    console.error("Erreur lors de la sauvegarde sync:", error);
  }
}

export async function getCachedData(key: string): Promise<any | null> {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_KEY}_${key}`);
    if (!cached) return null;

    const syncData: SyncData = JSON.parse(cached);
    return syncData.data;
  } catch (error) {
    console.error("Erreur lors de la lecture cache:", error);
    return null;
  }
}

export async function clearOldCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k: string) => k.startsWith(CACHE_KEY));

    for (const key of cacheKeys) {
      const cached = await AsyncStorage.getItem(key) as string | null;
      if (cached) {
        const syncData: SyncData = JSON.parse(cached);
        const now = Date.now();
        const timeDiff = now - syncData.timestamp;

        if (timeDiff > SYNC_INTERVAL * 2) {
          await AsyncStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error("Erreur lors du nettoyage cache:", error);
  }
}

export function getLastSyncTime(key: string): Promise<number | null> {
  return getCachedData(key)
    .then((data) => {
      if (!data) return null;
      // Récupérer le timestamp du cache
      return AsyncStorage.getItem(`${CACHE_KEY}_${key}`)
        .then((cached) => {
          if (!cached) return null;
          const syncData: SyncData = JSON.parse(cached);
          return syncData.timestamp;
        });
    });
}
