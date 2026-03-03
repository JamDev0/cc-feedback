# cc-feedback

In-product feedback capture: overlay UI, SDK, and API contract for **issue** and **capability** reports with optional text, voice, and screenshot.

## Repo structure

| Workspace | Purpose |
|-----------|--------|
| `packages/feedback-ui` | React overlay (`FeedbackOverlay`) and capture controls |
| `packages/feedback-sdk-core` | Shared types and validation |
| `packages/feedback-sdk-web` | Browser client and multipart submit |
| `apps/reference-react` | Reference host app integrating `@cc-feedback/ui` |
| `apps/mock-feedback-api` | Mock `POST /v1/feedback` for local development |

## Quick start

```bash
npm install
npm run -w @cc-feedback/mock-feedback-api dev   # Terminal 1
npm run -w @cc-feedback/reference-react dev    # Terminal 2
```

Open the reference app, trigger the feedback overlay, and submit an issue or capability report. Closing the overlay must unfreeze host interaction.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build all workspaces |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint |
| `npm run typecheck` | TypeScript check |

## Documentation

Source of truth lives in **`docs/feedback/`**:

- **[README](docs/feedback/README.md)** — Doc index and cross-doc invariants
- **[UI plan](docs/feedback/ui.md)** — Overlay lifecycle, state model, accessibility, host integration
- **[API contract](docs/feedback/api.md)** — `POST /v1/feedback` multipart schema, validation, errors
- **[Infrastructure](docs/feedback/infra.md)** — Anti-spam, retention, moderation, rollout
- **[Runbook](docs/feedback/runbook.md)** — Local smoke test, failure modes, playbooks, abuse response

Read in order: UI → API → Infra → Runbook.

## Contract highlights

- **Overlay**: Open/close freezes and unfreezes host interaction; `client.open()` / `client.close()` are required.
- **Submit**: At least one of `text` or `audio` is required; `metadata` is JSON in multipart form-data.
- **Issue** reports require `browserInfo` and `logsWindow`; **capability** reports do not.

## License

Private.
