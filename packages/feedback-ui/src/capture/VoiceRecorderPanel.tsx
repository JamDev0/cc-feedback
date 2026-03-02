import React, { useEffect, useRef, useState } from "react";
import { AudioRecorder } from "@cc-feedback/sdk-web";

interface VoiceRecorderPanelProps {
  onAudioReady: (audio: Blob) => void;
  onAudioRemove: () => void;
  hasAudio: boolean;
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceRecorderPanel({ onAudioReady, onAudioRemove, hasAudio }: VoiceRecorderPanelProps) {
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewUrlRef = useRef<string | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [error, setError] = useState<string>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const revokePreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = undefined;
    }
    setPreviewUrl(undefined);
    setPlaying(false);
    setRecordedDuration(0);
  };

  const stopPlayback = () => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setPlaying(false);
  };

  const startRecording = async () => {
    setError(undefined);
    stopPlayback();
    revokePreview();

    const recorder = new AudioRecorder();
    recorderRef.current = recorder;
    try {
      await recorder.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch (recordError) {
      const message =
        recordError instanceof Error
          ? recordError.message
          : "Unable to access microphone";
      setError(message);
      recorderRef.current = null;
    }
  };

  const stopRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const recorder = recorderRef.current;
    if (!recorder) return;
    const audio = await recorder.stop();
    recorderRef.current = null;
    setRecording(false);
    setRecordedDuration(elapsed);

    revokePreview();
    const url = URL.createObjectURL(audio);
    previewUrlRef.current = url;
    setPreviewUrl(url);

    onAudioReady(audio);
  };

  const togglePlayback = () => {
    const el = audioRef.current;
    if (!el) return;

    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play();
      setPlaying(true);
    }
  };

  const deleteAudio = () => {
    stopPlayback();
    revokePreview();
    onAudioRemove();
  };

  const showPlayback = hasAudio && Boolean(previewUrl) && !recording;

  return (
    <div>
      {previewUrl ? (
        <audio
          ref={audioRef}
          src={previewUrl}
          preload="metadata"
          onEnded={() => setPlaying(false)}
        />
      ) : null}

      <div className="cc-fb-recorder">
        {recording ? (
          <button
            type="button"
            className="cc-fb-rec-btn"
            data-recording="true"
            onClick={stopRecording}
          >
            <span className="cc-fb-rec-dot" />
            Stop recording
          </button>
        ) : showPlayback ? (
          <button
            type="button"
            className="cc-fb-play-btn"
            data-playing={playing}
            aria-label={playing ? "Pause voice memo" : "Play voice memo"}
            onClick={togglePlayback}
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <rect x="2" y="1" width="3.5" height="12" rx="1" />
                <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M3 1.5v11l9-5.5z" />
              </svg>
            )}
            {playing ? "Pause" : "Play"}
          </button>
        ) : (
          <button
            type="button"
            className="cc-fb-rec-btn"
            data-recording="false"
            onClick={startRecording}
          >
            <span className="cc-fb-rec-dot" />
            Record voice
          </button>
        )}

        <div className="cc-fb-rec-meta">
          {recording ? (
            <>
              <span className="cc-fb-rec-status">Recording</span>
              <span className="cc-fb-rec-time">{formatElapsed(elapsed)}</span>
            </>
          ) : hasAudio ? (
            <span className="cc-fb-rec-attached">
              Voice memo attached
              {recordedDuration > 0 ? ` \u00B7 ${formatElapsed(recordedDuration)}` : ""}
            </span>
          ) : (
            <span className="cc-fb-rec-status">No audio</span>
          )}
        </div>

        {showPlayback ? (
          <div className="cc-fb-rec-actions">
            <button
              type="button"
              className="cc-fb-rerecord-btn"
              onClick={startRecording}
            >
              Re-record
            </button>
            <button
              type="button"
              className="cc-fb-delete-btn"
              aria-label="Delete voice memo"
              onClick={deleteAudio}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="cc-fb-error" role="alert" style={{ marginTop: 8 }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
