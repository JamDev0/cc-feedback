import React from "react";

const CONFETTI_PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * 360;
  const rad = (angle * Math.PI) / 180;
  const distance = 40 + Math.random() * 50;
  const dx = Math.cos(rad) * distance;
  const dy = Math.sin(rad) * distance;
  const colors = ["#22c55e", "#0ea5e9", "#f59e0b", "#e11d48", "#8b5cf6", "#06b6d4"];
  return {
    dx,
    dy,
    color: colors[i % colors.length],
    delay: i * 0.04,
    size: 4 + Math.random() * 4
  };
});

export function RewardBurst({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="cc-fb-success" data-cc-feedback-overlay="true">
      <div className="cc-fb-confetti">
        {CONFETTI_PARTICLES.map((p, i) => (
          <span
            key={i}
            className="cc-fb-confetti-dot"
            style={{
              left: "50%",
              top: "40%",
              width: p.size,
              height: p.size,
              background: p.color,
              animationDelay: `${p.delay}s`,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`
            } as React.CSSProperties}
          />
        ))}
      </div>

      <svg
        className="cc-fb-success-check"
        viewBox="0 0 56 56"
        fill="none"
      >
        <circle
          className="cc-fb-success-circle"
          cx="28"
          cy="28"
          r="26"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          className="cc-fb-success-tick"
          d="M17 29l8 8 14-14"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <p className="cc-fb-success-label">Feedback sent</p>
      <p className="cc-fb-success-sub">Thanks for helping us improve</p>
    </div>
  );
}
