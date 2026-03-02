import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { VoiceRecorderPanel } from "./VoiceRecorderPanel";

const mockStart = vi.fn().mockResolvedValue(undefined);
const mockStop = vi.fn().mockResolvedValue(
  new Blob(["audio"], { type: "audio/webm" })
);

vi.mock("@cc-feedback/sdk-web", () => ({
  AudioRecorder: vi.fn().mockImplementation(() => ({
    start: mockStart,
    stop: mockStop,
  })),
}));

describe("VoiceRecorderPanel", () => {
  let playSpy: ReturnType<typeof vi.spyOn>;
  let pauseSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    globalThis.URL.revokeObjectURL = vi.fn();

    playSpy = vi
      .spyOn(HTMLAudioElement.prototype, "play")
      .mockResolvedValue(undefined);
    pauseSpy = vi
      .spyOn(HTMLAudioElement.prototype, "pause")
      .mockImplementation(() => {});
  });

  async function recordAndStop(
    onAudioReady = vi.fn(),
    onAudioRemove = vi.fn()
  ) {
    const result = render(
      <VoiceRecorderPanel onAudioReady={onAudioReady} onAudioRemove={onAudioRemove} hasAudio={false} />
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Record voice"));
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Stop recording"));
    });

    result.rerender(
      <VoiceRecorderPanel onAudioReady={onAudioReady} onAudioRemove={onAudioRemove} hasAudio={true} />
    );

    return { ...result, onAudioReady, onAudioRemove };
  }

  it("exposes play control after recording is attached", async () => {
    const { onAudioReady } = await recordAndStop();

    expect(onAudioReady).toHaveBeenCalledWith(expect.any(Blob));
    expect(
      screen.getByRole("button", { name: /play voice memo/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/voice memo attached/i)).toBeInTheDocument();
  });

  it("toggles to pause when play is clicked", async () => {
    await recordAndStop();

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /play voice memo/i })
      );
    });

    expect(playSpy).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("button", { name: /pause voice memo/i })
    ).toBeInTheDocument();
  });

  it("toggles back to play when pause is clicked", async () => {
    await recordAndStop();

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /play voice memo/i })
      );
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /pause voice memo/i })
      );
    });

    expect(pauseSpy).toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: /play voice memo/i })
    ).toBeInTheDocument();
  });

  it("keeps re-record available and replaces previous preview", async () => {
    await recordAndStop();

    expect(screen.getByText("Re-record")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText("Re-record"));
    });

    expect(screen.getByText("Stop recording")).toBeInTheDocument();
    expect(screen.queryByText("Re-record")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /play voice memo/i })
    ).not.toBeInTheDocument();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith(
      "blob:mock-url"
    );
  });

  it("calls onAudioRemove and resets to idle when delete is clicked", async () => {
    const { onAudioRemove, rerender } = await recordAndStop();

    const deleteBtn = screen.getByRole("button", { name: /delete voice memo/i });
    expect(deleteBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    rerender(
      <VoiceRecorderPanel onAudioReady={vi.fn()} onAudioRemove={onAudioRemove} hasAudio={false} />
    );

    expect(onAudioRemove).toHaveBeenCalledOnce();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    expect(screen.getByText("Record voice")).toBeInTheDocument();
    expect(screen.queryByText("Re-record")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /play voice memo/i })
    ).not.toBeInTheDocument();
  });
});
