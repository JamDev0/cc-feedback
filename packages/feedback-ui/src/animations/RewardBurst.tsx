import React from "react";

const dots = Array.from({ length: 6 }, (_, index) => index);

export function RewardBurst({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="cc-feedback-success" data-cc-feedback-overlay="true">
      {dots.map((dot) => (
        <span
          key={dot}
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            marginLeft: 4,
            borderRadius: 999,
            background: "rgba(110, 231, 183, 0.95)",
            transform: `translateY(${Math.sin(dot) * 4}px)`
          }}
        />
      ))}
    </div>
  );
}
