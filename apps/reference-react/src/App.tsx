import { useMemo, useState } from "react";
import { FeedbackOverlay } from "@cc-feedback/ui";
import type { HostAdapter } from "@cc-feedback/sdk-core";
import { createFeedbackClient } from "./feedback/createClient";

const sessionFingerprint = crypto.randomUUID();

function createHostAdapter(): HostAdapter {
  return {
    pausePolling: () => console.info("pause polling"),
    pauseRealtime: () => console.info("pause realtime"),
    resumeAll: () => console.info("resume all"),
    captureLogsWindow: (windowMs: number) => [
      {
        timestamp: new Date().toISOString(),
        level: "info",
        message: `Mocked logs for last ${windowMs}ms`
      }
    ]
  };
}

export default function App() {
  const [open, setOpen] = useState(false);
  const client = useMemo(() => createFeedbackClient(createHostAdapter()), []);

  return (
    <main className="app-shell">
      <h1 className="app-title">Reference React App</h1>
      <p className="app-subtitle">
        Use this page to verify the feedback overlay integration in isolation.
      </p>
      <button
        type="button"
        className="app-trigger"
        onClick={() => setOpen(true)}
      >
        Open Feedback
      </button>

      {open ? (
        <FeedbackOverlay
          client={client}
          sessionFingerprint={sessionFingerprint}
          route={window.location.pathname}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </main>
  );
}
