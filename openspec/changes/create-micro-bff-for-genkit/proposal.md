## Why

The brag-bot frontend currently renders brags from **mock data** (`BragService.loadMockData` / `generateMockBrag`), while the AI generation capability (`bragGeneratorFlow`) and a server route (`/api/brag`) already exist. As a result, the UI never reflects real AI output — users see fabricated placeholders instead of genuine, structured Brag Documents. This change wires the frontend to the real flow through a **Micro-BFF** (the `server.ts` route proxying to the Genkit flow), completing the end-to-end integration so the app delivers real value.

## What Changes

- **Backend route (`server.ts`)** — expose `POST /api/brag` that reads `req.body.definition`, invokes `bragGeneratorFlow` with `{ definition }`, returns `{ brag }` as JSON, and returns HTTP 500 on error (400 on missing `definition`). *Status: already implemented and verified during planning — keep as-is.*
- **Angular HTTP config (`app.config.ts`)** — provide `HttpClient` via `provideHttpClient(withFetch())` for SSR compatibility. *Status: already implemented and verified during planning — keep as-is.*
- **`BragService`** — remove all mock data (`loadMockData`, `generateMockBrag`); inject `HttpClient`; add the real `generateBrag(definition: string)` method.
- **Response mapping** — transform the flow's `BragSchema` response (`title, context, actionTaken, businessImpact, metrics, technologiesUsed, id`) into the Angular `Brag` interface (`title, context, impact ← businessImpact, metrics, technologies ← technologiesUsed, rawInput ← definition, createdAt ← now, id`), actionTaken is missing o Angular Brag, refactor Angular `Brag` interface to add it.


- **Dashboard call site** — `DashboardComponent` calls `generateBrag(prompt)` instead of `generateMockBrag(prompt)`.
- **Build validation** — run `npm run build` and fix any TypeScript / SSR / dependency errors until the build is green.

## Capabilities

### New Capabilities
- `brag-bff`: Micro-BFF integration layer — the server route that proxies to `bragGeneratorFlow` and the Angular HTTP client service that consumes it, replacing the mock data source.

### Modified Capabilities
- None. The AI flow itself is covered by the existing `generate-brag-document` capability; this change adds the integration layer without altering flow requirements.

## Impact

- `src/server.ts` — target implementation already present (verified); no change expected.
- `src/app/app.config.ts` — target implementation already present (verified); no change expected.
- `src/app/services/brag.service.ts` — significant rewrite (remove mock, add HTTP-backed `generateBrag`).
- `src/app/components/dashboard/dashboard.component.ts` — call-site swap from `generateMockBrag` → `generateBrag`.
- `dist/` build output — must build cleanly under SSR.
- Runtime dependency: a valid Genkit/Google AI key (`.env`) for `/api/brag` to succeed at runtime (client handles failure gracefully).
