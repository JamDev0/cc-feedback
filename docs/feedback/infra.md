# Infrastructure Plan

Related docs: [UI plan](./ui.md), [API contract](./api.md), [Runbook](./runbook.md).

## Deployment Topology

- Browser clients submit multipart payloads to `/v1/feedback`.
- API ingress validates baseline request shape and enforces size/rate policies.
- Accepted payloads are persisted and/or queued for asynchronous moderation and triage.
- Media objects (`audio`, `screenshot`) are stored separately from indexed metadata.

## Anti-Spam Strategy (Anonymous Sessions)

### Session Fingerprint Guardrails

- Use `sessionFingerprint` as the primary anonymous throttle key.
- Apply token-bucket rate limiting per session in SDK and API edge.
- Add secondary IP/user-agent heuristics at ingress for burst suppression.

### Request Integrity Controls

- Require valid `metadata` JSON and minimum schema fields.
- Reject malformed multipart payloads early.
- Enforce max body/file size with explicit rejection reason.

### Abuse Hardening

- Introduce challenge escalation (silent score -> CAPTCHA -> hard block) at high-risk thresholds.
- Maintain denylist for known abusive session fingerprints/IPs.
- Flag suspicious payload patterns for moderation review.

## Data Retention And Lifecycle

- Metadata index retention: 90 days (default, configurable by policy).
- Media retention: 30-90 days based on incident triage requirements.
- Hard-delete workflow for privacy/legal requests.
- Daily lifecycle jobs remove expired media and tombstone orphaned metadata.

## Moderation Pipeline

- Queue all accepted submissions for asynchronous enrichment and review.
- Auto-tag by type (`issue`/`capability`) and confidence markers.
- Route high-severity issue reports to on-call or incident tooling.
- Keep moderation decisions auditable (decision, actor/system, timestamp, reason).

## Observability Requirements

### Metrics

- Request throughput (total, by type).
- Acceptance/rejection rates by validation code.
- Rate-limit hits and challenge escalation counts.
- End-to-end ingestion latency and storage queue lag.

### Logs

- Structured logs with `traceId`, session hash, and outcome code.
- Error logs for parse/validation failures and storage/queue exceptions.
- Redaction policy to avoid leaking sensitive text or raw PII.

### Alerts

- High 5xx error rate.
- Sudden increase in rate-limited or malformed submissions.
- Queue lag exceeding service objectives.
- Storage write failures.

## Rollout Phases

1. **Phase 0 - Local mock**
   - Validate multipart contract and UI integration with `apps/mock-feedback-api`.
2. **Phase 1 - Internal preview**
   - Enable in non-production environments with moderate throttles and verbose observability.
3. **Phase 2 - Controlled production**
   - Gradual tenant/app rollout with active moderation and tuned rate limits.
4. **Phase 3 - General availability**
   - Stable SLOs, hardened abuse controls, and formal runbook/on-call ownership.
