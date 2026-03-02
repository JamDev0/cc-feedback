import type { HostAdapter } from "../adapters/HostAdapter";
export declare class FreezeController {
    private readonly hostAdapter?;
    private readonly freezeRoot;
    private frozen;
    constructor(hostAdapter?: HostAdapter | undefined, freezeRoot?: HTMLElement);
    freeze(): void;
    unfreeze(): void;
    isFrozen(): boolean;
}
export declare const freezeStyles = "\n.cc-feedback-frozen *:not([data-cc-feedback-overlay=\"true\"]):not([data-cc-feedback-overlay=\"true\"] *) {\n  animation-play-state: paused !important;\n  pointer-events: none !important;\n}\n";
//# sourceMappingURL=FreezeController.d.ts.map