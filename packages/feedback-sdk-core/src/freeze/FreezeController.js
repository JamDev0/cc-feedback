const FREEZE_CLASS = "cc-feedback-frozen";
export class FreezeController {
    hostAdapter;
    freezeRoot;
    frozen = false;
    constructor(hostAdapter, freezeRoot = document.body) {
        this.hostAdapter = hostAdapter;
        this.freezeRoot = freezeRoot;
    }
    freeze() {
        if (this.frozen)
            return;
        this.frozen = true;
        this.hostAdapter?.pausePolling?.();
        this.hostAdapter?.pauseRealtime?.();
        this.freezeRoot.classList.add(FREEZE_CLASS);
        this.freezeRoot.setAttribute("aria-busy", "true");
    }
    unfreeze() {
        if (!this.frozen)
            return;
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
//# sourceMappingURL=FreezeController.js.map