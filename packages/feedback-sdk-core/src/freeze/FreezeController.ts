import type { HostAdapter } from "../adapters/HostAdapter";

const FREEZE_CLASS = "cc-feedback-frozen";

export class FreezeController {
  private frozen = false;

  constructor(
    private readonly hostAdapter?: HostAdapter,
    private readonly freezeRoot: HTMLElement = document.body
  ) {}

  freeze() {
    if (this.frozen) return;
    this.frozen = true;

    this.hostAdapter?.pausePolling?.();
    this.hostAdapter?.pauseRealtime?.();

    this.freezeRoot.classList.add(FREEZE_CLASS);
    this.freezeRoot.setAttribute("aria-busy", "true");
  }

  unfreeze() {
    if (!this.frozen) return;
    this.frozen = false;

    this.hostAdapter?.resumeAll?.();
    this.freezeRoot.classList.remove(FREEZE_CLASS);
    this.freezeRoot.removeAttribute("aria-busy");
  }

  isFrozen() {
    return this.frozen;
  }
}

export const freezeStyles = `
.${FREEZE_CLASS} *:not([data-cc-feedback-overlay="true"]):not([data-cc-feedback-overlay="true"] *) {
  animation-play-state: paused !important;
  pointer-events: none !important;
}
`;
