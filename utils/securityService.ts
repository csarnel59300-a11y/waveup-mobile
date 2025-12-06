import AsyncStorage from '@react-native-async-storage/async-storage';

export type SecurityFlag = 'AI' | 'LEADERBOARD' | 'ANALYTICS' | 'IDEAS' | 'TRENDS' | 'ALL';

interface SecurityState {
  globalLockActive: boolean;
  disabledModules: SecurityFlag[];
  lastAnomaly?: {
    type: string;
    timestamp: number;
    details: string;
  };
}

const SECURITY_KEY = 'waveup_security_state';
const ANOMALY_THRESHOLD = 3;

class SecurityService {
  private anomalyCount = 0;

  async getSecurityState(): Promise<SecurityState> {
    try {
      const stored = await AsyncStorage.getItem(SECURITY_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultState();
    } catch {
      return this.getDefaultState();
    }
  }

  private getDefaultState(): SecurityState {
    return {
      globalLockActive: false,
      disabledModules: [],
    };
  }

  async detectAnomaly(type: string, details: string): Promise<void> {
    try {
      this.anomalyCount++;
      if (this.anomalyCount >= ANOMALY_THRESHOLD) {
        await this.activateGlobalLock([type as SecurityFlag]);
      }
    } catch (error) {
      console.error('Anomaly detection error:', error);
    }
  }

  async disableModule(module: SecurityFlag): Promise<void> {
    try {
      const state = await this.getSecurityState();
      if (!state.disabledModules.includes(module)) {
        state.disabledModules.push(module);
        await AsyncStorage.setItem(SECURITY_KEY, JSON.stringify(state));
      }
    } catch (error) {
      console.error('Module disable error:', error);
    }
  }

  async activateGlobalLock(triggeredBy: SecurityFlag[]): Promise<void> {
    try {
      const state: SecurityState = {
        globalLockActive: true,
        disabledModules: triggeredBy,
        lastAnomaly: {
          type: 'GLOBAL_LOCK_ACTIVATED',
          timestamp: Date.now(),
          details: `Triggered by: ${triggeredBy.join(', ')}`,
        },
      };
      await AsyncStorage.setItem(SECURITY_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Global lock error:', error);
    }
  }

  async releaseGlobalLock(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SECURITY_KEY);
      this.anomalyCount = 0;
    } catch (error) {
      console.error('Release lock error:', error);
    }
  }

  async isModuleEnabled(module: SecurityFlag): Promise<boolean> {
    try {
      const state = await this.getSecurityState();
      if (state.globalLockActive) return false;
      return !state.disabledModules.includes(module);
    } catch {
      return true;
    }
  }

  isGlobalLocked(): boolean {
    return false;
  }

  getEnabledModules(): SecurityFlag[] {
    return ['AI', 'LEADERBOARD', 'ANALYTICS', 'IDEAS', 'TRENDS'];
  }
}

export const securityService = new SecurityService();
