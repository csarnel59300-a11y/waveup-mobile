interface FeatureFlags {
  aiEnabled: boolean;
  leaderboardEnabled: boolean;
  analyticsEnabled: boolean;
  ideasEnabled: boolean;
  trendsEnabled: boolean;
  maintenanceMode: boolean;
}

class RemoteConfigService {
  private flags: FeatureFlags = {
    aiEnabled: true,
    leaderboardEnabled: true,
    analyticsEnabled: true,
    ideasEnabled: true,
    trendsEnabled: true,
    maintenanceMode: false,
  };

  async initialize(): Promise<void> {
    // Local feature flags - can be updated via settings
    console.log('Feature flags initialized');
  }

  getFeatureFlags(): FeatureFlags {
    return this.flags;
  }

  async updateFeatureFlag(key: keyof FeatureFlags, value: boolean): Promise<void> {
    this.flags[key] = value;
    console.log(`Feature flag updated: ${key} = ${value}`);
  }
}

export const remoteConfigService = new RemoteConfigService();
