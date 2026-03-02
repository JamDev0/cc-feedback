export interface SessionRateLimiterOptions {
    capacity?: number;
    refillEveryMs?: number;
    refillAmount?: number;
}
export declare class SessionRateLimiter {
    private readonly buckets;
    private readonly capacity;
    private readonly refillEveryMs;
    private readonly refillAmount;
    constructor(options?: SessionRateLimiterOptions);
    canSubmit(sessionFingerprint: string, now?: number): boolean;
    private getState;
    private refill;
}
//# sourceMappingURL=SessionRateLimiter.d.ts.map