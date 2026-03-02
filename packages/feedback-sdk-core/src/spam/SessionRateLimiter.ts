interface BucketState {
  tokens: number;
  lastRefillMs: number;
}

export interface SessionRateLimiterOptions {
  capacity?: number;
  refillEveryMs?: number;
  refillAmount?: number;
}

export class SessionRateLimiter {
  private readonly buckets = new Map<string, BucketState>();
  private readonly capacity: number;
  private readonly refillEveryMs: number;
  private readonly refillAmount: number;

  constructor(options: SessionRateLimiterOptions = {}) {
    this.capacity = options.capacity ?? 5;
    this.refillEveryMs = options.refillEveryMs ?? 10 * 60 * 1000;
    this.refillAmount = options.refillAmount ?? 5;
  }

  canSubmit(sessionFingerprint: string, now = Date.now()) {
    const state = this.getState(sessionFingerprint, now);
    this.refill(state, now);

    if (state.tokens <= 0) return false;
    state.tokens -= 1;
    return true;
  }

  private getState(key: string, now: number) {
    const existing = this.buckets.get(key);
    if (existing) return existing;

    const state: BucketState = { tokens: this.capacity, lastRefillMs: now };
    this.buckets.set(key, state);
    return state;
  }

  private refill(state: BucketState, now: number) {
    const elapsed = now - state.lastRefillMs;
    if (elapsed < this.refillEveryMs) return;

    const refillTimes = Math.floor(elapsed / this.refillEveryMs);
    state.tokens = Math.min(this.capacity, state.tokens + refillTimes * this.refillAmount);
    state.lastRefillMs = now;
  }
}
