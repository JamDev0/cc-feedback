import { describe, expect, it } from "vitest";
import { validateFeedbackSubmission } from "../src/validation/feedbackSchema";

const baseMetadata = {
  type: "capability" as const,
  sdkVersion: "0.1.0",
  traceId: "trace-1",
  clientTimestamp: new Date().toISOString(),
  sessionFingerprint: "session-a"
};

describe("validateFeedbackSubmission", () => {
  it("shouldRequireAudioOrText", () => {
    expect(() => validateFeedbackSubmission({ metadata: baseMetadata })).toThrowError(
      "audio_or_text_required"
    );
  });

  it("should require logs and browserInfo for issue", () => {
    expect(() =>
      validateFeedbackSubmission({
        metadata: { ...baseMetadata, type: "issue" }
      })
    ).toThrowError("issue_logs_required");
  });

  it("should pass with issue metadata and audio", () => {
    const blob = new Blob(["voice"], { type: "audio/webm" });
    expect(() =>
      validateFeedbackSubmission({
        audio: blob,
        metadata: {
          ...baseMetadata,
          type: "issue",
          logsWindow: [{ timestamp: new Date().toISOString(), level: "info", message: "ok" }],
          browserInfo: {
            userAgent: "ua",
            platform: "linux",
            language: "en-US",
            viewport: { width: 100, height: 100 },
            timezone: "UTC"
          }
        }
      })
    ).not.toThrow();
  });
});
