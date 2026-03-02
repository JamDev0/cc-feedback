import type { FeedbackLogEntry } from "../types";

export interface HostAdapter {
  pausePolling?: () => void;
  pauseRealtime?: () => void;
  resumeAll?: () => void;
  captureLogsWindow?: (windowMs: number) => FeedbackLogEntry[];
}
