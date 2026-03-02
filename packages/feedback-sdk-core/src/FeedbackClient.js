import { FeedbackApiClient } from "./api/FeedbackApiClient";
import { FreezeController } from "./freeze/FreezeController";
import { SessionRateLimiter } from "./spam/SessionRateLimiter";
import { validateFeedbackSubmission } from "./validation/feedbackSchema";
export class FeedbackClient {
    config;
    hostAdapter;
    freezeController;
    apiClient;
    rateLimiter;
    constructor(config, hostAdapter) {
        this.config = config;
        this.hostAdapter = hostAdapter;
        this.freezeController = new FreezeController(hostAdapter);
        this.apiClient = new FeedbackApiClient(config);
        this.rateLimiter = new SessionRateLimiter();
    }
    open() {
        this.freezeController.freeze();
    }
    close() {
        this.freezeController.unfreeze();
    }
    isFrozen() {
        return this.freezeController.isFrozen();
    }
    async submit(input) {
        const sessionKey = input.metadata.sessionFingerprint;
        if (!this.rateLimiter.canSubmit(sessionKey)) {
            throw new Error("Rate limited. Please try again later.");
        }
        if (input.metadata.type === "issue") {
            input.metadata.logsWindow ??= this.hostAdapter?.captureLogsWindow?.(5 * 60 * 1000);
        }
        validateFeedbackSubmission(input);
        const shouldFreezeForSubmit = !this.isFrozen();
        if (shouldFreezeForSubmit) {
            this.open();
        }
        try {
            await this.apiClient.submit(input);
        }
        finally {
            if (shouldFreezeForSubmit) {
                this.close();
            }
        }
    }
}
//# sourceMappingURL=FeedbackClient.js.map