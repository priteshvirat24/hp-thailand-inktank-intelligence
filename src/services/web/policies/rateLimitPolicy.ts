/**
 * Per-Domain Rate Limiting & Throttling Engine
 */

interface DomainRateState {
  lastRequestAt: number;
  currentBackoffMs: number;
  consecutiveErrors: number;
}

export class RateLimitPolicyEngine {
  private domainStates = new Map<string, DomainRateState>();
  private defaultDelayMs = 250; // 250ms spacing per domain

  /**
   * Applies rate limiting wait before hitting a domain.
   */
  public async throttle(domain: string): Promise<void> {
    const state = this.domainStates.get(domain) || {
      lastRequestAt: 0,
      currentBackoffMs: this.defaultDelayMs,
      consecutiveErrors: 0,
    };

    const now = Date.now();
    const elapsed = now - state.lastRequestAt;
    const requiredDelay = state.currentBackoffMs;

    if (elapsed < requiredDelay) {
      const waitTime = requiredDelay - elapsed;
      await new Promise((resolve) => setTimeout(resolve, Math.min(waitTime, 5000)));
    }

    state.lastRequestAt = Date.now();
    this.domainStates.set(domain, state);
  }

  /**
   * Records success for a domain, resetting backoff.
   */
  public recordSuccess(domain: string): void {
    const state = this.domainStates.get(domain);
    if (state) {
      state.consecutiveErrors = 0;
      state.currentBackoffMs = this.defaultDelayMs;
    }
  }

  /**
   * Records rate limit (HTTP 429) or transient error, triggering exponential backoff.
   */
  public recordError(domain: string, retryAfterSeconds?: number): void {
    const state = this.domainStates.get(domain) || {
      lastRequestAt: Date.now(),
      currentBackoffMs: this.defaultDelayMs,
      consecutiveErrors: 0,
    };

    state.consecutiveErrors++;
    if (retryAfterSeconds && retryAfterSeconds > 0) {
      state.currentBackoffMs = retryAfterSeconds * 1000;
    } else {
      // Exponential backoff capped at 10 seconds
      state.currentBackoffMs = Math.min(10000, state.currentBackoffMs * 2);
    }

    this.domainStates.set(domain, state);
  }
}

export const rateLimitPolicyEngine = new RateLimitPolicyEngine();
