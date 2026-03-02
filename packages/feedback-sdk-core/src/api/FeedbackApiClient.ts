import type { FeedbackClientConfig } from "../config";
import type { FeedbackSubmissionInput } from "../types";

export class FeedbackApiClient {
  constructor(private readonly config: FeedbackClientConfig) {}

  async submit(input: FeedbackSubmissionInput) {
    const formData = new FormData();
    formData.append("metadata", JSON.stringify(input.metadata));
    if (input.audio) formData.append("audio", input.audio, "feedback-audio.webm");
    if (input.screenshot) formData.append("screenshot", input.screenshot, "feedback-screenshot.png");

    const controller = new AbortController();
    const timeoutMs = this.config.requestTimeoutMs ?? 15_000;
    const timeoutHandle = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(this.config.endpointUrl, {
        method: "POST",
        body: formData,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Feedback submission failed with status ${response.status}`);
      }
    } finally {
      window.clearTimeout(timeoutHandle);
    }
  }
}
