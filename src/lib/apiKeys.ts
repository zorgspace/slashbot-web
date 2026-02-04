/**
 * API Key Manager with Rotation
 * Manages multiple xAI API keys for rate limit distribution
 */

interface ApiKeyStatus {
  key: string;
  requestCount: number;
  lastUsed: number;
  rateLimitedUntil: number;
  errorCount: number;
}

interface ApiKeyConfig {
  /** Maximum requests per minute per key */
  maxRpm: number;
  /** Cooldown period after rate limit (ms) */
  rateLimitCooldown: number;
  /** Max consecutive errors before marking key unhealthy */
  maxErrors: number;
}

const DEFAULT_CONFIG: ApiKeyConfig = {
  maxRpm: 60, // 60 requests per minute
  rateLimitCooldown: 60_000, // 1 minute cooldown
  maxErrors: 5,
};

class ApiKeyManager {
  private keys: Map<string, ApiKeyStatus> = new Map();
  private config: ApiKeyConfig;
  private requestWindow: Map<string, number[]> = new Map(); // key -> timestamps

  constructor(config: Partial<ApiKeyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadKeys();
  }

  /**
   * Load API keys from environment
   */
  private loadKeys(): void {
    // Support multiple keys: GROK_API_KEY, GROK_API_KEY_1, GROK_API_KEY_2, etc.
    const envKeys = [
      process.env.GROK_API_KEY,
      process.env.GROK_API_KEY_1,
      process.env.GROK_API_KEY_2,
      process.env.GROK_API_KEY_3,
      process.env.GROK_API_KEY_4,
      process.env.GROK_API_KEY_5,
      process.env.XAI_API_KEY,
      process.env.XAI_API_KEY_1,
      process.env.XAI_API_KEY_2,
    ].filter((key): key is string => !!key);

    // Remove duplicates
    const uniqueKeys = [...new Set(envKeys)];

    for (const key of uniqueKeys) {
      this.keys.set(key, {
        key,
        requestCount: 0,
        lastUsed: 0,
        rateLimitedUntil: 0,
        errorCount: 0,
      });
      this.requestWindow.set(key, []);
    }

    console.log(`[ApiKeyManager] Loaded ${this.keys.size} API keys`);
  }

  /**
   * Get the next available API key using round-robin with health checks
   */
  getNextKey(): string | null {
    const now = Date.now();
    const oneMinuteAgo = now - 60_000;

    let bestKey: ApiKeyStatus | null = null;
    let lowestUsage = Infinity;

    for (const [, status] of this.keys) {
      // Skip rate-limited keys
      if (status.rateLimitedUntil > now) {
        continue;
      }

      // Skip keys with too many errors
      if (status.errorCount >= this.config.maxErrors) {
        continue;
      }

      // Clean old requests from window
      const window = this.requestWindow.get(status.key) || [];
      const recentRequests = window.filter((t) => t > oneMinuteAgo);
      this.requestWindow.set(status.key, recentRequests);

      // Skip if at rate limit
      if (recentRequests.length >= this.config.maxRpm) {
        continue;
      }

      // Pick key with lowest recent usage
      if (recentRequests.length < lowestUsage) {
        lowestUsage = recentRequests.length;
        bestKey = status;
      }
    }

    return bestKey?.key || null;
  }

  /**
   * Record a successful request
   */
  recordSuccess(key: string): void {
    const status = this.keys.get(key);
    if (!status) return;

    status.requestCount++;
    status.lastUsed = Date.now();
    status.errorCount = 0; // Reset error count on success

    const window = this.requestWindow.get(key) || [];
    window.push(Date.now());
    this.requestWindow.set(key, window);
  }

  /**
   * Record a rate limit error
   */
  recordRateLimit(key: string): void {
    const status = this.keys.get(key);
    if (!status) return;

    status.rateLimitedUntil = Date.now() + this.config.rateLimitCooldown;
    console.log(`[ApiKeyManager] Key ${key.slice(0, 8)}... rate limited until ${new Date(status.rateLimitedUntil).toISOString()}`);
  }

  /**
   * Record a general error
   */
  recordError(key: string): void {
    const status = this.keys.get(key);
    if (!status) return;

    status.errorCount++;
    if (status.errorCount >= this.config.maxErrors) {
      console.log(`[ApiKeyManager] Key ${key.slice(0, 8)}... marked unhealthy after ${status.errorCount} errors`);
    }
  }

  /**
   * Reset a key's error count (e.g., after manual intervention)
   */
  resetKey(key: string): void {
    const status = this.keys.get(key);
    if (!status) return;

    status.errorCount = 0;
    status.rateLimitedUntil = 0;
  }

  /**
   * Get status of all keys (for monitoring)
   */
  getStatus(): Array<{
    keyPrefix: string;
    requestCount: number;
    recentRequests: number;
    isRateLimited: boolean;
    isHealthy: boolean;
  }> {
    const now = Date.now();
    const oneMinuteAgo = now - 60_000;

    return Array.from(this.keys.values()).map((status) => {
      const window = this.requestWindow.get(status.key) || [];
      const recentRequests = window.filter((t) => t > oneMinuteAgo).length;

      return {
        keyPrefix: status.key.slice(0, 8) + '...',
        requestCount: status.requestCount,
        recentRequests,
        isRateLimited: status.rateLimitedUntil > now,
        isHealthy: status.errorCount < this.config.maxErrors,
      };
    });
  }

  /**
   * Check if any keys are available
   */
  hasAvailableKeys(): boolean {
    return this.getNextKey() !== null;
  }

  /**
   * Get total number of configured keys
   */
  getKeyCount(): number {
    return this.keys.size;
  }
}

// Singleton instance
let apiKeyManager: ApiKeyManager | null = null;

export function getApiKeyManager(): ApiKeyManager {
  if (!apiKeyManager) {
    apiKeyManager = new ApiKeyManager();
  }
  return apiKeyManager;
}

export type { ApiKeyStatus, ApiKeyConfig };
