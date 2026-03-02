import type { HostAdapter } from "./adapters/HostAdapter";
import { FeedbackApiClient } from "./api/FeedbackApiClient";
import type { FeedbackClientConfig } from "./config";
import { FreezeController } from "./freeze/FreezeController";
import { SessionRateLimiter } from "./spam/SessionRateLimiter";
import type { FeedbackSubmissionInput } from "./types";
import { validateFeedbackSubmission } from "./validation/feedbackSchema";

export class FeedbackClient {
  private readonly freezeController: FreezeController;
  private readonly apiClient: FeedbackApiClient;
  private readonly rateLimiter: SessionRateLimiter;

  constructor(
    private readonly config: FeedbackClientConfig,
    private readonly hostAdapter?: HostAdapter
  ) {
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

  async submit(input: FeedbackSubmissionInput) {
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
    } finally {
      if (shouldFreezeForSubmit) {
        this.close();
      }
    }
  }
}
