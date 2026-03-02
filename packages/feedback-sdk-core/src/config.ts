export interface FeedbackClientConfig {
  endpointUrl: string;
  sdkVersion: string;
  appVersion?: string;
  requestTimeoutMs?: number;
}

export const defaultConfig: Pick<FeedbackClientConfig, "requestTimeoutMs" | "sdkVersion"> = {
  requestTimeoutMs: 15_000,
  sdkVersion: "0.1.0"
};
