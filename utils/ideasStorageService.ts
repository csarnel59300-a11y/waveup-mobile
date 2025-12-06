import AsyncStorage from "@react-native-async-storage/async-storage";

const IDEAS_STORAGE_KEY = "waveup_saved_ideas";

export interface SavedIdea {
  id: string;
  title: string;
  content: string;
  type: "bio" | "comment" | "dm" | "caption" | "script";
  savedAt: string;
  rating: number;
}

export const ideasStorageService = {
  getSavedIdeas: async (): Promise<SavedIdea[]> => {
    try {
      const data = await AsyncStorage.getItem(IDEAS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading saved ideas:", error);
      return [];
    }
  },

  saveIdea: async (title: string, content: string, type: SavedIdea["type"]) => {
    try {
      const ideas = await ideasStorageService.getSavedIdeas();
      const newIdea: SavedIdea = {
        id: Date.now().toString(),
        title,
        content,
        type,
        savedAt: new Date().toISOString(),
        rating: 0,
      };
      ideas.push(newIdea);
      await AsyncStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
      return newIdea;
    } catch (error) {
      console.error("Error saving idea:", error);
      return null;
    }
  },

  deleteIdea: async (id: string) => {
    try {
      let ideas = await ideasStorageService.getSavedIdeas();
      ideas = ideas.filter((idea) => idea.id !== id);
      await AsyncStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
      return true;
    } catch (error) {
      console.error("Error deleting idea:", error);
      return false;
    }
  },

  rateIdea: async (id: string, rating: number) => {
    try {
      const ideas = await ideasStorageService.getSavedIdeas();
      const idea = ideas.find((i) => i.id === id);
      if (idea) {
        idea.rating = Math.max(0, Math.min(5, rating));
        await AsyncStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
        return idea;
      }
      return null;
    } catch (error) {
      console.error("Error rating idea:", error);
      return null;
    }
  },
};
