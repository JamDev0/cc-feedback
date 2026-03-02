import type { HostAdapter } from "./adapters/HostAdapter";
import type { FeedbackClientConfig } from "./config";
import type { FeedbackSubmissionInput } from "./types";
export declare class FeedbackClient {
    private readonly config;
    private readonly hostAdapter?;
    private readonly freezeController;
    private readonly apiClient;
    private readonly rateLimiter;
    constructor(config: FeedbackClientConfig, hostAdapter?: HostAdapter | undefined);
    open(): void;
    close(): void;
    isFrozen(): boolean;
    submit(input: FeedbackSubmissionInput): Promise<void>;
}
//# sourceMappingURL=FeedbackClient.d.ts.map