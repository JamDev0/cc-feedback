import { FeedbackClient, type HostAdapter } from "@cc-feedback/sdk-core";

export const FEEDBACK_ENDPOINT = "https://feedback.example.com/v1/feedback";

export function createFeedbackClient(hostAdapter?: HostAdapter) {
  return new FeedbackClient(
    {
      endpointUrl: FEEDBACK_ENDPOINT,
      sdkVersion: "0.1.0",
      appVersion: "reference-react",
      requestTimeoutMs: 10_000
    },
    hostAdapter
  );
}
