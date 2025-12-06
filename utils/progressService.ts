import AsyncStorage from "@react-native-async-storage/async-storage";

const METRICS_STORAGE_KEY = "waveup_metrics_history";

export interface MetricSnapshot {
  date: string;
  followers: number;
  likes: number;
  views: number;
  engagementRate: number;
  videosPosted: number;
}

export interface MetricsHistory {
  snapshots: MetricSnapshot[];
}

// Mock data generator
function generateMockMetrics(): MetricSnapshot {
  const randomVariation = (base: number) => Math.round(base * (0.9 + Math.random() * 0.2));
  
  return {
    date: new Date().toISOString().split('T')[0],
    followers: randomVariation(12400),
    likes: randomVariation(156000),
    views: randomVariation(450000),
    engagementRate: parseFloat((3 + Math.random() * 4).toFixed(2)),
    videosPosted: Math.floor(Math.random() * 5) + 1,
  };
}

export const progressService = {
  // Get or initialize metrics history
  getHistory: async (): Promise<MetricsHistory> => {
    try {
      const data = await AsyncStorage.getItem(METRICS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      // Initialize with 30 days of mock data
      const snapshots: MetricSnapshot[] = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        snapshots.push({
          ...generateMockMetrics(),
          date: date.toISOString().split('T')[0],
        });
      }
      const history = { snapshots };
      await AsyncStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(history));
      return history;
    } catch (error) {
      console.error("Error getting metrics history:", error);
      return { snapshots: [] };
    }
  },

  // Add new metric snapshot (daily update)
  addSnapshot: async (metrics: Omit<MetricSnapshot, 'date'>) => {
    try {
      const history = await progressService.getHistory();
      const today = new Date().toISOString().split('T')[0];
      
      // Remove old entry for today if exists
      history.snapshots = history.snapshots.filter(s => s.date !== today);
      
      // Add new snapshot
      history.snapshots.push({
        ...metrics,
        date: today,
      });
      
      // Keep only last 365 days
      if (history.snapshots.length > 365) {
        history.snapshots = history.snapshots.slice(-365);
      }
      
      await AsyncStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error("Error adding snapshot:", error);
      return false;
    }
  },

  // Get metrics for last N days
  getRecentMetrics: async (days: number = 30): Promise<MetricSnapshot[]> => {
    try {
      const history = await progressService.getHistory();
      return history.snapshots.slice(-days);
    } catch (error) {
      console.error("Error getting recent metrics:", error);
      return [];
    }
  },

  // Calculate growth statistics
  calculateStats: (metrics: MetricSnapshot[]): { [key: string]: string } => {
    if (metrics.length < 2) return {};
    
    const first = metrics[0];
    const last = metrics[metrics.length - 1];
    
    const followersGrowth = ((last.followers - first.followers) / first.followers * 100).toFixed(1);
    const likesGrowth = ((last.likes - first.likes) / first.likes * 100).toFixed(1);
    const viewsGrowth = ((last.views - first.views) / first.views * 100).toFixed(1);
    const avgEngagement = (metrics.reduce((sum, m) => sum + m.engagementRate, 0) / metrics.length).toFixed(2);
    
    return {
      followersGrowth: `${followersGrowth}%`,
      likesGrowth: `${likesGrowth}%`,
      viewsGrowth: `${viewsGrowth}%`,
      avgEngagement: `${avgEngagement}%`,
    };
  },
};
