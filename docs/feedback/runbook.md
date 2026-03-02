# Feedback Operations Runbook

Related docs: [README index](./README.md), [UI plan](./ui.md), [API contract](./api.md), [Infra plan](./infra.md).

## Operational Steps

### Local Smoke Test

1. Install dependencies at repo root: `npm install`
2. Start mock API: `npm run -w @cc-feedback/mock-feedback-api dev`
3. Start reference app: `npm run -w @cc-feedback/reference-react dev`
4. Open feedback overlay and submit both:
   - issue report with audio or text
   - capability report with text
5. Confirm overlay close unfreezes host interaction.

### API Intake Verification

- API logs show request accepted for `/v1/feedback`.
- Response is `202` with `{ id, status }`.
- Validation failures return expected `4xx` codes/messages.

## Failure Modes

- **Malformed metadata**
  - Symptoms: `400 metadata must be a JSON string form field` or `400 metadata is not valid JSON`
  - Action: verify multipart composer sends `metadata` as JSON string
- **Validation rejection**
  - Symptoms: `422` codes such as `audio_or_text_required`
  - Action: inspect client payload construction by feedback type
- **Rate-limited session**
  - Symptoms: repeated submit failures with rate-limit message/code
  - Action: confirm anti-spam thresholds and session keying behavior
- **Transport/network failure**
  - Symptoms: browser network errors, timeouts, CORS failures
  - Action: validate endpoint, CORS policy, ingress health, TLS
- **Backend 5xx**
  - Symptoms: failed submission with server error
  - Action: check logs by trace ID, queue/storage dependencies, recent deploys

## Playbooks

### Playbook: Overlay Freeze/Unfreeze Regression

1. Reproduce in reference app.
2. Verify overlay mount triggers freeze (`cc-feedback-frozen`, `aria-busy=true`).
3. Verify close/cancel and unmount clear freeze state.
4. Verify failed submit does not leave app permanently frozen.
5. File bug with reproduction, browser version, and trace IDs.

### Playbook: Ingestion Contract Drift

1. Capture outgoing multipart payload from browser devtools.
2. Compare fields against [`api.md`](./api.md).
3. Validate conditional issue-only diagnostics.
4. Deploy contract fix in SDK/client first, then API fallback if needed.

### Playbook: Queue Or Storage Degradation

1. Check ingestion success vs processing lag metrics.
2. Drain or scale workers.
3. Enable temporary backpressure/rate tightening.
4. Communicate degraded mode to stakeholders.

## Abuse Response Procedures

1. Detect anomaly from alerts (rate spike, repeated invalid payloads, suspicious session/IP clusters).
2. Triage severity:
   - low: monitor and tune thresholds
   - medium: challenge or temporary throttle escalation
   - high: blocklist sessions/IPs and activate incident channel
3. Preserve forensic context:
   - sample payload metadata
   - request logs and trace IDs
   - timestamped moderation decisions
4. Mitigate:
   - deploy stricter rules (size/rate/content heuristics)
   - protect downstream queue/storage
5. Recover:
   - remove temporary blocks carefully
   - run post-incident review with updated guardrails

## Escalation And Ownership

- Product/UI owner: behavior and accessibility regressions.
- API owner: contract validation and response semantics.
- Infra/on-call owner: availability, abuse controls, and data lifecycle.
