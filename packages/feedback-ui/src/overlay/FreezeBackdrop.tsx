import React from "react";

export function FreezeBackdrop() {
  return (
    <div
      className="cc-fb-backdrop"
      aria-hidden="true"
      data-cc-feedback-overlay="true"
    />
  );
}
