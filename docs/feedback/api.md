# API Contract Plan

Mock API implementation lives in `apps/mock-feedback-api`.

Related docs: [UI plan](./ui.md), [Infra plan](./infra.md), [Runbook](./runbook.md).

## Endpoint Contract

- Method: `POST`
- Path: `/v1/feedback`
- Content type: `multipart/form-data`
- Auth: optional in local mock; required in production boundary.

## Multipart Form Fields

- `metadata` (required): JSON string containing structured metadata.
- `audio` (optional): voice attachment (`audio/webm` recommended).
- `screenshot` (optional): screenshot attachment (`image/png` recommended).

## Metadata Schema

### Required Base Fields

- `type`: `"issue" | "capability"`
- `sdkVersion`: string
- `traceId`: string
- `clientTimestamp`: ISO-8601 timestamp string
- `sessionFingerprint`: anonymous session identifier

### Optional Base Fields

- `text`: string (trimmed, may be absent)
- `appVersion`: string
- `route`: string
- `browserInfo`: object
- `logsWindow`: array of log entries

### Conditional Rules

- At least one of `metadata.text` or `audio` must be present.
- If `type === "issue"`:
  - `browserInfo` is required.
  - `logsWindow` must exist and contain at least one entry.
- If `type === "capability"`:
  - `browserInfo` and `logsWindow` are optional and typically omitted.

## Multipart Examples

### cURL Example

```bash
curl -X POST "https://feedback.example.com/v1/feedback" \
  -F 'metadata={
    "type":"issue",
    "text":"Editor hangs after save",
    "sdkVersion":"0.1.0",
    "appVersion":"reference-react",
    "traceId":"f2c48f0e-0320-4e85-8f78-cf0fa5775b5b",
    "clientTimestamp":"2026-03-02T12:00:00.000Z",
    "sessionFingerprint":"anon-session-123",
    "route":"/settings",
    "browserInfo":{
      "userAgent":"Mozilla/5.0 ...",
      "platform":"Linux x86_64",
      "language":"en-US",
      "viewport":{"width":1440,"height":900},
      "timezone":"UTC"
    },
    "logsWindow":[{"timestamp":"2026-03-02T11:58:00.000Z","level":"error","message":"Network timeout"}]
  };type=application/json' \
  -F "audio=@feedback-audio.webm;type=audio/webm" \
  -F "screenshot=@feedback-screenshot.png;type=image/png"
```

### Successful Response

```json
{
  "id": "uuid",
  "status": "accepted"
}
```

## Validation Matrix

- Missing `metadata` form field -> `400 metadata must be a JSON string form field`
- Invalid JSON string in `metadata` -> `400 metadata is not valid JSON`
- Missing `text` and missing `audio` -> `422 audio_or_text_required`
- `type=issue` with missing logs -> `422 issue_logs_required`
- `type=issue` with missing browser info -> `422 issue_browser_info_required`
- Empty audio blob -> `422 audio_empty`
- Oversized screenshot (>4MB) -> `413 screenshot_too_large` (or `422`, depending on gateway policy)

## Error Model

- Validation errors: `4xx` with machine-readable `code` and human-readable `message`.
- Transport and timeout errors: surfaced as client network failures.
- Server failures: `5xx` with correlation ID in logs and response where possible.

Recommended error body:

```json
{
  "code": "issue_logs_required",
  "message": "Issue submissions must include recent logs",
  "traceId": "f2c48f0e-0320-4e85-8f78-cf0fa5775b5b"
}
```

## Versioning Notes

- Current contract version is implicit (`/v1/feedback`).
- Backward-compatible additions are allowed for optional metadata fields.
- Breaking changes require:
  - endpoint version bump (e.g., `/v2/feedback`) or
  - compatibility window with dual validation paths.
- Keep SDK and API docs in lockstep whenever validation rules change.
