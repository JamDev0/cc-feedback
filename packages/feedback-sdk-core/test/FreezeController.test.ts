import { describe, expect, it, vi } from "vitest";
import { FreezeController } from "../src/freeze/FreezeController";

describe("FreezeController", () => {
  it("shouldFreezeHostInteractionWhenOverlayOpens", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const pausePolling = vi.fn();
    const pauseRealtime = vi.fn();
    const resumeAll = vi.fn();
    const controller = new FreezeController({ pausePolling, pauseRealtime, resumeAll }, root);

    controller.freeze();
    expect(controller.isFrozen()).toBe(true);
    expect(root.classList.contains("cc-feedback-frozen")).toBe(true);
    expect(pausePolling).toHaveBeenCalledOnce();
    expect(pauseRealtime).toHaveBeenCalledOnce();

    controller.unfreeze();
    expect(controller.isFrozen()).toBe(false);
    expect(root.classList.contains("cc-feedback-frozen")).toBe(false);
    expect(resumeAll).toHaveBeenCalledOnce();
  });
});
