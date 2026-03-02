export type FeedbackType = "issue" | "capability";

export interface FeedbackLogEntry {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  context?: Record<string, string | number | boolean | null>;
}

export interface BrowserInfo {
  userAgent: string;
  platform: string;
  language: string;
  viewport: { width: number; height: number };
  timezone: string;
}

export interface FeedbackMetadata {
  type: FeedbackType;
  text?: string;
  appVersion?: string;
  sdkVersion: string;
  route?: string;
  traceId: string;
  clientTimestamp: string;
  sessionFingerprint: string;
  browserInfo?: BrowserInfo;
  logsWindow?: FeedbackLogEntry[];
}

export interface FeedbackSubmissionInput {
  metadata: FeedbackMetadata;
  audio?: Blob;
  screenshot?: Blob;
}
