import { beforeEach, describe, expect, it, vi } from "vitest";
import { FeedbackClient } from "../src/FeedbackClient";
import type { FeedbackSubmissionInput } from "../src/types";

describe("FeedbackClient", () => {
  const successResponse = { ok: true, status: 202 };

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(successResponse));
  });

  it("shouldAlwaysUnfreezeOnCloseCancelOrError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      })
    );
    const resumeAll = vi.fn();
    const client = new FeedbackClient(
      { endpointUrl: "https://feedback.example.com/v1/feedback", sdkVersion: "0.1.0" },
      { resumeAll }
    );

    client.open();
    expect(client.isFrozen()).toBe(true);
    client.close();
    expect(client.isFrozen()).toBe(false);

    const input: FeedbackSubmissionInput = {
      audio: new Blob(["a"], { type: "audio/webm" }),
      metadata: {
        type: "capability",
        sdkVersion: "0.1.0",
        traceId: "trace-2",
        clientTimestamp: new Date().toISOString(),
        sessionFingerprint: "session-test"
      }
    };

    await expect(client.submit(input)).rejects.toThrowError("status 500");
    expect(resumeAll).toHaveBeenCalledTimes(2);
    expect(client.isFrozen()).toBe(false);
  });

  it("shouldAttachLogsAndBrowserInfoForIssueOnly", async () => {
    const captureLogsWindow = vi.fn().mockReturnValue([
      { timestamp: new Date().toISOString(), level: "error", message: "broken" }
    ]);

    const client = new FeedbackClient(
      { endpointUrl: "https://feedback.example.com/v1/feedback", sdkVersion: "0.1.0" },
      {
        captureLogsWindow
      }
    );
    const issueInput: FeedbackSubmissionInput = {
      audio: new Blob(["a"], { type: "audio/webm" }),
      metadata: {
        type: "issue",
        sdkVersion: "0.1.0",
        traceId: "trace-3",
        clientTimestamp: new Date().toISOString(),
        sessionFingerprint: "session-test",
        browserInfo: {
          userAgent: "ua",
          platform: "linux",
          language: "en-US",
          viewport: { width: 100, height: 100 },
          timezone: "UTC"
        }
      }
    };

    await client.submit(issueInput);
    expect(captureLogsWindow).toHaveBeenCalledWith(300000);
    expect(issueInput.metadata.logsWindow).toHaveLength(1);

    const capabilityInput: FeedbackSubmissionInput = {
      audio: new Blob(["b"], { type: "audio/webm" }),
      metadata: {
        type: "capability",
        sdkVersion: "0.1.0",
        traceId: "trace-4",
        clientTimestamp: new Date().toISOString(),
        sessionFingerprint: "session-test"
      }
    };

    await client.submit(capabilityInput);
    expect(captureLogsWindow).toHaveBeenCalledOnce();
    expect(capabilityInput.metadata.logsWindow).toBeUndefined();
    expect(capabilityInput.metadata.browserInfo).toBeUndefined();
  });

  it("shouldSendMultipartPayloadToConfiguredEndpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(successResponse);
    vi.stubGlobal("fetch", fetchMock);

    const client = new FeedbackClient({
      endpointUrl: "https://feedback.example.com/v1/feedback",
      sdkVersion: "0.1.0"
    });

    const input: FeedbackSubmissionInput = {
      audio: new Blob(["voice"], { type: "audio/webm" }),
      screenshot: new Blob(["pixels"], { type: "image/png" }),
      metadata: {
        type: "capability",
        text: "Great feature",
        sdkVersion: "0.1.0",
        traceId: "trace-multipart",
        clientTimestamp: new Date().toISOString(),
        sessionFingerprint: "session-form"
      }
    };

    await client.submit(input);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://feedback.example.com/v1/feedback");
    expect(requestInit.method).toBe("POST");
    expect(requestInit.body).toBeInstanceOf(FormData);

    const body = requestInit.body as FormData;
    expect(body.get("metadata")).toBeTruthy();
    expect(body.get("audio")).toBeInstanceOf(Blob);
    expect(body.get("screenshot")).toBeInstanceOf(Blob);
  });

  it("shouldThrottleRepeatedSubmissionsPerSession", async () => {
    const client = new FeedbackClient({
      endpointUrl: "https://feedback.example.com/v1/feedback",
      sdkVersion: "0.1.0"
    });

    const createInput = (traceId: string): FeedbackSubmissionInput => ({
      audio: new Blob([traceId], { type: "audio/webm" }),
      metadata: {
        type: "capability",
        sdkVersion: "0.1.0",
        traceId,
        clientTimestamp: new Date().toISOString(),
        sessionFingerprint: "same-session"
      }
    });

    await client.submit(createInput("trace-1"));
    await client.submit(createInput("trace-2"));
    await client.submit(createInput("trace-3"));
    await client.submit(createInput("trace-4"));
    await client.submit(createInput("trace-5"));
    await expect(client.submit(createInput("trace-6"))).rejects.toThrowError("Rate limited");
  });
});
