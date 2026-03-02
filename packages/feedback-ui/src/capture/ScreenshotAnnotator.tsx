import React, { useEffect, useRef, useState } from "react";

interface ScreenshotAnnotatorProps {
  screenshot: Blob;
  onAnnotated: (blob: Blob) => void;
}

export function ScreenshotAnnotator({ screenshot, onAnnotated }: ScreenshotAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);

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

  return (
    <div className="cc-fb-canvas-wrap">
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
