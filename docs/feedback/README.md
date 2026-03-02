# Feedback System Docs

This folder is the source of truth for the end-to-end feedback capability.

## Document Index

- [UI plan and interaction contract](./ui.md)
- [API contract and validation model](./api.md)
- [Infrastructure and anti-spam plan](./infra.md)
- [Operational runbook and abuse response](./runbook.md)

## How To Read This Set

1. Start with [`ui.md`](./ui.md) to understand product behavior, state transitions, and overlay lifecycle guarantees.
2. Continue with [`api.md`](./api.md) for payload structure, multipart examples, and server-side validation/error rules.
3. Review [`infra.md`](./infra.md) for anonymous-session anti-spam controls, moderation, storage, retention, and rollout stages.
4. Use [`runbook.md`](./runbook.md) when operating the system, debugging incidents, or handling abuse events.

## Cross-Doc Invariants

- Overlay open/close lifecycle must freeze and unfreeze host interaction safely.
- `metadata` is always submitted as JSON inside multipart form-data.
- At least one user signal (`text` or `audio`) is required.
- `issue` reports carry extra diagnostics (browser info + logs); `capability` reports do not require them.
