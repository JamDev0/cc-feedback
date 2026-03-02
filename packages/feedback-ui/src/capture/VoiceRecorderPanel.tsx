import React, { useRef, useState } from "react";
import { AudioRecorder } from "@cc-feedback/sdk-web";

interface VoiceRecorderPanelProps {
  onAudioReady: (audio: Blob) => void;
}

export function VoiceRecorderPanel({ onAudioReady }: VoiceRecorderPanelProps) {
  const recorderRef = useRef<AudioRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string>();

  const startRecording = async () => {
    setError(undefined);
    const recorder = new AudioRecorder();
    recorderRef.current = recorder;
    try {
      await recorder.start();
      setRecording(true);
    } catch (recordError) {
      const message = recordError instanceof Error ? recordError.message : "Unable to access microphone";
      setError(message);
      recorderRef.current = null;
    }
  };

  const stopRecording = async () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    const audio = await recorder.stop();
    recorderRef.current = null;
    setRecording(false);
    onAudioReady(audio);
  };

  return (
    <div>
      <div className="cc-feedback-row">
        {!recording ? (
          <button type="button" onClick={startRecording}>
            Hold to record
          </button>
        ) : (
          <button type="button" onClick={stopRecording}>
            Stop recording
          </button>
        )}
        <span className="cc-feedback-pill">{recording ? "Recording..." : "Idle"}</span>
      </div>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
