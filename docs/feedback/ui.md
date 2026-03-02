# UI Plan

`apps/reference-react` demonstrates the baseline host integration for `@cc-feedback/ui`.

Related docs: [API contract](./api.md), [Infra plan](./infra.md), [Runbook](./runbook.md).

## Scope And Goals

- Provide low-friction feedback capture directly in-product.
- Support two intents: `issue` and `capability`.
- Allow submission with text, audio, optional screenshot annotation.
- Keep host app safe while overlay is open by freezing host interaction.

## End-To-End User Flows

### Open Overlay

1. Host renders `FeedbackOverlay` with a configured `FeedbackClient`.
2. Overlay mount invokes `client.open()`.
3. Host interaction is frozen (`cc-feedback-frozen` class + `aria-busy=true`).
4. Dialog receives focus and presents intent toggles plus capture controls.

### Submit Success

1. User provides at least one signal (`text` or `audio`).
2. Optional screenshot is captured/annotated.
3. Submit triggers SDK validation and multipart upload.
4. UI transitions to submitted confirmation state.
5. User closes overlay; close path unfreezes host safely.

### Submit Failure

1. Submit request fails due to validation/network/server errors.
2. Error message is shown in alert region.
3. Overlay remains open and editable.
4. Freeze state remains active while overlay is visible.
5. Close/cancel still guarantees unfreeze.

### Cancel / Explicit Close

1. User clicks **Close**.
2. Overlay triggers `client.close()` and then host `onClose`.
3. Host unmounts overlay.
4. Cleanup path is idempotent and leaves host unfrozen.

## UI State Model

- `open`: overlay visible, host frozen.
- `submitting`: submit disabled, progress text shown.
- `submitted`: success animation visible.
- `error`: accessible error region populated.
- `closed`: overlay unmounted, host unfrozen.

### Core State Rules

- `canSubmit = Boolean(audio || text.trim())`.
- `issue` mode includes browser diagnostics in metadata.
- `capability` mode omits issue-only diagnostics by default.
- Freeze/unfreeze is idempotent and safe on repeated calls.

## Permissions And Browser Capabilities

- Microphone permission required for voice recording.
- Screen capture permission may be required depending on screenshot approach.
- Browsers that deny permissions must still allow text-only submission.
- Permission failures are surfaced as user-readable errors.

## Accessibility Requirements

- Overlay container uses `role="dialog"` and `aria-modal="true"`.
- Title and controls must be keyboard reachable in logical order.
- Error text is rendered with `role="alert"` for immediate announcement.
- Buttons expose state (`disabled`, `aria-pressed`) correctly.
- Host freeze sets `aria-busy=true` on freeze root while active.

## Animation And Motion Guidance

- Keep success animation short and non-blocking.
- Respect reduced-motion preferences by shortening or disabling decorative bursts.
- Never tie functional completion to animation end.
- Use opacity/transform animations to avoid layout thrash.

## Integration Contract (Host <-> Overlay <-> SDK)

- Host owns overlay visibility and supplies `onClose` unmount behavior.
- Overlay owns capture UI and invokes `FeedbackClient.submit`.
- Overlay open lifecycle must call `client.open()` once per mount.
- Overlay close lifecycle must call `client.close()` before/with unmount.
- SDK submit must not unfreeze if overlay already holds freeze ownership.

## Acceptance Checklist

- [ ] Opening overlay freezes host interaction and marks root busy.
- [ ] Closing/canceling overlay always unfreezes host interaction.
- [ ] Failed submit keeps overlay open and preserves freeze until close.
- [ ] Submit blocked unless text or audio is present.
- [ ] Issue mode sends browser diagnostics; capability mode does not require them.
- [ ] Overlay keyboard interaction works (tab/shift-tab/escape strategy).
- [ ] Error announcements are exposed via alert semantics.
- [ ] Recorded voice memo exposes play/pause control for preview before submit.
- [ ] Re-record option is available after a voice memo is attached.
- [ ] Starting a new recording stops any active playback and revokes the previous preview.
- [ ] Reference app behavior matches this contract exactly.
