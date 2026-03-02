import type { FeedbackClientConfig } from "../config";
import type { FeedbackSubmissionInput } from "../types";
export declare class FeedbackApiClient {
    private readonly config;
    constructor(config: FeedbackClientConfig);
    submit(input: FeedbackSubmissionInput): Promise<void>;
}
//# sourceMappingURL=FeedbackApiClient.d.ts.map