import type { FeedbackSubmissionInput } from "../types";
export declare class FeedbackValidationError extends Error {
    readonly violations: string[];
    constructor(violations: string[]);
}
export declare function validateFeedbackSubmission(input: FeedbackSubmissionInput): void;
//# sourceMappingURL=feedbackSchema.d.ts.map