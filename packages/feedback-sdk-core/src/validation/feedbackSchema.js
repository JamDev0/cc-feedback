export class FeedbackValidationError extends Error {
    violations;
    constructor(violations) {
        super(`Invalid feedback payload: ${violations.join(", ")}`);
        this.violations = violations;
    }
}
export function validateFeedbackSubmission(input) {
    const violations = [];
    const hasText = Boolean(input.metadata.text?.trim());
    const hasAudio = Boolean(input.audio);
    if (!hasText && !hasAudio) {
        violations.push("audio_or_text_required");
    }
    if (input.metadata.type === "issue") {
        if (!input.metadata.logsWindow?.length)
            violations.push("issue_logs_required");
        if (!input.metadata.browserInfo)
            violations.push("issue_browser_info_required");
    }
    if (input.screenshot && input.screenshot.size > 4 * 1024 * 1024) {
        violations.push("screenshot_too_large");
    }
    if (input.audio && input.audio.size === 0) {
        violations.push("audio_empty");
    }
    if (violations.length)
        throw new FeedbackValidationError(violations);
}
//# sourceMappingURL=feedbackSchema.js.map