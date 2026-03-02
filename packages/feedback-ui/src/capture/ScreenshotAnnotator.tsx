import React, { useEffect, useRef, useState } from "react";

interface ScreenshotAnnotatorProps {
  screenshot: Blob;
  onAnnotated: (blob: Blob) => void;
  onDone: () => void;
}

export function ScreenshotAnnotator({ screenshot, onAnnotated, onDone }: ScreenshotAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const historyRef = useRef<ImageData[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [undoCount, setUndoCount] = useState(0);

  useEffect(() => {
    doneRef.current?.focus();
  }, []);

  useEffect(() => {
    const url = URL.createObjectURL(screenshot);
    const image = new Image();
    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }, [screenshot]);

  const withPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const { x, y } = withPosition(event);
    context.lineWidth = 3;
    context.strokeStyle = "#ef4444";
    context.lineTo(x, y);
    context.stroke();
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    historyRef.current.push(
      context.getImageData(0, 0, canvas.width, canvas.height)
    );
    setUndoCount(historyRef.current.length);

    canvas.setPointerCapture(event.pointerId);
    const { x, y } = withPosition(event);
    context.beginPath();
    context.moveTo(x, y);
    setDrawing(true);
  };

  const stop = async (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    setDrawing(false);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (blob) onAnnotated(blob);
  };

  const undo = async () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const previous = historyRef.current.pop();
    if (!previous) return;
    context.putImageData(previous, 0, 0);
    setUndoCount(historyRef.current.length);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (blob) onAnnotated(blob);
  };

  return (
    <div className="cc-fb-canvas-wrap">
      <div className="cc-fb-canvas-toolbar">
        <button
          type="button"
          className="cc-fb-undo-btn"
          onClick={undo}
          disabled={undoCount === 0}
          aria-label="Undo last stroke"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 5.5h5.5a3 3 0 1 1 0 6H7" />
            <path d="M5.5 3L3 5.5 5.5 8" />
          </svg>
          Undo
        </button>
        <button
          ref={doneRef}
          type="button"
          className="cc-fb-done-btn"
          onClick={onDone}
          aria-label="Finish annotation"
        >
          Done
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={stop}
        onPointerCancel={stop}
        onPointerLeave={stop}
      />
    </div>
  );
}
