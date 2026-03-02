import React, { useEffect, useMemo, useRef, useState } from "react";
import type { FeedbackClient, FeedbackType } from "@cc-feedback/sdk-core";
import { collectBrowserInfo, captureViewportScreenshot } from "@cc-feedback/sdk-web";
import { RewardBurst } from "../animations/RewardBurst";
import { ScreenshotAnnotator } from "../capture/ScreenshotAnnotator";
import { ScreenshotPreview } from "../capture/ScreenshotPreview";
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
  const [annotating, setAnnotating] = useState(false);
  const wasAnnotatingRef = useRef(false);

  useEffect(() => {
    wasAnnotatingRef.current = annotating;
  }, [annotating]);

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
      const message =
        submitError instanceof Error ? submitError.message : "Submission failed";
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
    <div data-cc-theme="blueprint" data-cc-feedback-overlay="true">
      <FreezeBackdrop />
      <section
        aria-label="Feedback"
        role="dialog"
        aria-modal="true"
        className="cc-fb"
        data-cc-feedback-overlay="true"
      >
        <header className="cc-fb-header">
          <h2 className="cc-fb-title">Share feedback</h2>
          <button
            type="button"
            className="cc-fb-close"
            onClick={close}
            aria-label="Close feedback"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </header>

        <div className="cc-fb-intent">
          <button
            type="button"
            className="cc-fb-intent-btn"
            data-active={type === "issue"}
            aria-pressed={type === "issue"}
            onClick={() => setType("issue")}
          >
            Report issue
          </button>
          <button
            type="button"
            className="cc-fb-intent-btn"
            data-active={type === "capability"}
            aria-pressed={type === "capability"}
            onClick={() => setType("capability")}
          >
            Request feature
          </button>
        </div>

        <div className="cc-fb-body">
          {annotating && screenshot ? (
            <ScreenshotAnnotator
              screenshot={screenshot}
              onAnnotated={setScreenshot}
              onDone={() => setAnnotating(false)}
            />
          ) : (
            <>
              <VoiceRecorderPanel
                onAudioReady={setAudio}
                onAudioRemove={() => setAudio(undefined)}
                hasAudio={Boolean(audio)}
              />

              <div className="cc-fb-field">
                <label className="cc-fb-label" htmlFor="cc-fb-text">
                  Description
                </label>
                <textarea
                  id="cc-fb-text"
                  className="cc-fb-textarea"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="What happened? What would you like to see?"
                />
              </div>

              <div className="cc-fb-capture-row">
                <button type="button" className="cc-fb-capture-btn" onClick={takeScreenshot}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="12" height="10" rx="2" />
                    <circle cx="8" cy="8" r="2.5" />
                    <path d="M5 3V2M11 3V2" />
                  </svg>
                  Capture screenshot
                </button>
              </div>

              {screenshot ? (
                <ScreenshotPreview
                  screenshot={screenshot}
                  onAnnotate={() => setAnnotating(true)}
                  onRemove={() => setScreenshot(undefined)}
                  returnFocus={wasAnnotatingRef.current}
                />
              ) : null}

              {type === "issue" ? (
                <p className="cc-fb-info">
                  Issue reports include browser diagnostics and recent activity logs.
                </p>
              ) : null}

              {error ? (
                <p className="cc-fb-error" role="alert">
                  {error}
                </p>
              ) : null}
            </>
          )}
        </div>

        <hr className="cc-fb-divider" />

        <footer className="cc-fb-footer">
          <button
            type="button"
            className="cc-fb-submit"
            disabled={!canSubmit || submitting}
            onClick={submit}
          >
            {submitting ? "Sending\u2026" : "Submit feedback"}
          </button>
        </footer>

        <RewardBurst visible={submitted} />
      </section>
    </div>
  );
}
