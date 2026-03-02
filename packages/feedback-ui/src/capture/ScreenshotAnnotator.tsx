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

  const withPosition = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const { x, y } = withPosition(event);
    context.lineWidth = 3;
    context.strokeStyle = "#ef4444";
    context.lineTo(x, y);
    context.stroke();
  };

  const start = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) return;
    const { x, y } = withPosition(event);
    context.beginPath();
    context.moveTo(x, y);
    setDrawing(true);
  };

  const stop = async () => {
    setDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (blob) onAnnotated(blob);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={start}
        onMouseMove={draw}
        onMouseUp={stop}
        onMouseLeave={stop}
        style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)" }}
      />
    </div>
  );
}
