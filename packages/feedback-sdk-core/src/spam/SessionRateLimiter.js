export class SessionRateLimiter {
    buckets = new Map();
    capacity;
    refillEveryMs;
    refillAmount;
    constructor(options = {}) {
        this.capacity = options.capacity ?? 5;
        this.refillEveryMs = options.refillEveryMs ?? 10 * 60 * 1000;
        this.refillAmount = options.refillAmount ?? 5;
    }
    canSubmit(sessionFingerprint, now = Date.now()) {
        const state = this.getState(sessionFingerprint, now);
        this.refill(state, now);
        if (state.tokens <= 0)
            return false;
        state.tokens -= 1;
        return true;
    }
    getState(key, now) {
        const existing = this.buckets.get(key);
        if (existing)
            return existing;
        const state = { tokens: this.capacity, lastRefillMs: now };
        this.buckets.set(key, state);
        return state;
    }
    refill(state, now) {
        const elapsed = now - state.lastRefillMs;
        if (elapsed < this.refillEveryMs)
            return;
        const refillTimes = Math.floor(elapsed / this.refillEveryMs);
        state.tokens = Math.min(this.capacity, state.tokens + refillTimes * this.refillAmount);
        state.lastRefillMs = now;
    }
}
//# sourceMappingURL=SessionRateLimiter.js.map