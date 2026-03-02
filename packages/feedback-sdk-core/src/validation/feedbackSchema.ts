import type { FeedbackSubmissionInput } from "../types";

export class FeedbackValidationError extends Error {
  constructor(public readonly violations: string[]) {
    super(`Invalid feedback payload: ${violations.join(", ")}`);
  }
}

export function validateFeedbackSubmission(input: FeedbackSubmissionInput) {
  const violations: string[] = [];
  const hasText = Boolean(input.metadata.text?.trim());
  const hasAudio = Boolean(input.audio);

  if (!hasText && !hasAudio) {
    violations.push("audio_or_text_required");
  }

  if (input.metadata.type === "issue") {
    if (!input.metadata.logsWindow?.length) violations.push("issue_logs_required");
    if (!input.metadata.browserInfo) violations.push("issue_browser_info_required");
  }

  if (input.screenshot && input.screenshot.size > 4 * 1024 * 1024) {
    violations.push("screenshot_too_large");
  }

  if (input.audio && input.audio.size === 0) {
    violations.push("audio_empty");
  }

  if (violations.length) throw new FeedbackValidationError(violations);
}
