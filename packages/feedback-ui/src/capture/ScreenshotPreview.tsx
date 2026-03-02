import React, { useEffect, useRef, useState } from "react";

interface ScreenshotPreviewProps {
  screenshot: Blob;
  onAnnotate: () => void;
  onRemove: () => void;
  returnFocus?: boolean;
}

export function ScreenshotPreview({ screenshot, onAnnotate, onRemove, returnFocus }: ScreenshotPreviewProps) {
  const [src, setSrc] = useState<string>();
  const annotateRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(screenshot);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  useEffect(() => {
    if (returnFocus) annotateRef.current?.focus();
  }, [returnFocus]);

  return (
    <div className="cc-fb-screenshot-preview">
      {src && (
        <img src={src} alt="Captured screenshot" draggable={false} />
      )}
      <div className="cc-fb-screenshot-actions">
        <button
          ref={annotateRef}
          type="button"
          className="cc-fb-screenshot-action-btn"
          onClick={onAnnotate}
          aria-label="Annotate screenshot"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8.5 2.5l3 3M1.5 9.5l6-6 3 3-6 6H1.5v-3z" />
          </svg>
          Annotate
        </button>
        <button
          type="button"
          className="cc-fb-screenshot-action-btn cc-fb-screenshot-remove-btn"
          onClick={onRemove}
          aria-label="Remove screenshot"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="M1 1l10 10M11 1L1 11" />
          </svg>
        </button>
      </div>
    </div>
  );
}
