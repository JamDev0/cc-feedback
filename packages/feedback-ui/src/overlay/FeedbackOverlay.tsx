import React, { useEffect, useMemo, useState } from "react";
import type { FeedbackClient, FeedbackType } from "@cc-feedback/sdk-core";
import { collectBrowserInfo, captureViewportScreenshot } from "@cc-feedback/sdk-web";
import { RewardBurst } from "../animations/RewardBurst";
import { ScreenshotAnnotator } from "../capture/ScreenshotAnnotator";
import { VoiceRecorderPanel } from "../capture/VoiceRecorderPanel";
import { FreezeBackdrop } from "./FreezeBackdrop";
import "../styles.css";

export interface FeedbackOverlayProps {
  client: FeedbackClient;
  sessionFingerprint: string;
  route?: string;
  sdkVersion?: string;
  appVersion?: string;
  onClose?: () => void;
}

export function FeedbackOverlay({
  client,
  sessionFingerprint,
  route,
  sdkVersion = "0.1.0",
  appVersion,
  onClose
}: FeedbackOverlayProps) {
  const [type, setType] = useState<FeedbackType>("issue");
  const [text, setText] = useState("");
  const [audio, setAudio] = useState<Blob>();
  const [screenshot, setScreenshot] = useState<Blob>();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    client.open();
    return () => client.close();
  }, [client]);

  const canSubmit = useMemo(() => Boolean(audio || text.trim()), [audio, text]);

  const takeScreenshot = async () => {
    const shot = await captureViewportScreenshot();
    setScreenshot(shot);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(undefined);

    try {
      await client.submit({
        audio,
        screenshot,
        metadata: {
          type,
          text: text.trim() || undefined,
          traceId: crypto.randomUUID(),
          sessionFingerprint,
          route,
          sdkVersion,
          appVersion,
          clientTimestamp: new Date().toISOString(),
          browserInfo: type === "issue" ? collectBrowserInfo() : undefined
        }
      });
      setSubmitted(true);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Submission failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    client.close();
    onClose?.();
  };

  return (
    <>
      <FreezeBackdrop />
      <section
        aria-label="Voice feedback"
        role="dialog"
        aria-modal="true"
        className="cc-feedback-shell"
        data-cc-feedback-overlay="true"
      >
        <RewardBurst visible={submitted} />
        <h2>Feedback</h2>

        <div className="cc-feedback-row">
          <button type="button" onClick={() => setType("issue")} aria-pressed={type === "issue"}>
            Issue
          </button>
          <button
            type="button"
            onClick={() => setType("capability")}
            aria-pressed={type === "capability"}
          >
            Capability
          </button>
        </div>

        <VoiceRecorderPanel onAudioReady={setAudio} />
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Optional text (or voice only)"
        />

        <div className="cc-feedback-row">
          <button type="button" onClick={takeScreenshot}>
            Capture screenshot
          </button>
          {screenshot ? <span className="cc-feedback-pill">Screenshot attached</span> : null}
        </div>

        {screenshot ? <ScreenshotAnnotator screenshot={screenshot} onAnnotated={setScreenshot} /> : null}

        {type === "issue" ? (
          <p className="cc-feedback-pill">Issue reports include browser info and the last 5 min logs.</p>
        ) : null}

        {error ? <p role="alert">{error}</p> : null}

        <div className="cc-feedback-row">
          <button type="button" disabled={!canSubmit || submitting} onClick={submit}>
            {submitting ? "Sending..." : "Submit"}
          </button>
          <button type="button" onClick={close}>
            Close
          </button>
        </div>
      </section>
    </>
  );
}
