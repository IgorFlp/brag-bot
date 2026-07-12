## Context

The brag-bot app is an Angular 21 SSR application. The AI capability was already built in a prior change (`generate-brag-document`): `src/flows.ts` defines `bragGeneratorFlow` (input `BragInputSchema`, output `BragSchema`) and `src/server.ts` already exposes `POST /api/brag` that calls `bragGeneratorFlow.run({ definition })` and returns `{ brag }`. `src/app/app.config.ts` already provides `provideHttpClient(withFetch())`.

The only gap is the data layer on the frontend. `BragService` still seeds the UI from `loadMockData()` and `generateMockBrag()` (random template + 1.5s delay). The `DashboardComponent` calls `generateMockBrag(prompt)`. So the live AI output is never shown.

Two interfaces exist with **different shapes**:
- Flow `BragSchema` (`src/flows.ts`): `title, context, actionTaken, businessImpact, metrics[], technologiesUsed[], id`.
- Angular `Brag` interface (`brag.service.ts`): `id, title, context, impact, metrics[], technologies[], rawInput, createdAt`.

The UI templates (dashboard + details) consume the Angular `Brag` fields: `title, context, impact, metrics, technologies, rawInput, createdAt, id`.

## Goals / Non-Goals

**Goals:**
- Replace mock generation with a real HTTP-backed `generateBrag` that calls `/api/brag`.
- Keep the two existing UI templates unchanged by mapping at the service boundary.
- Preserve the existing `loading` / `error` / `brags` signals and SSR compatibility.
- Ensure the project builds cleanly (`ng build`, SSR) after the change.

**Non-Goals:**
- Changing `BragSchema` / the Genkit flow in `src/flows.ts`.
- Editing the dashboard or details HTML templates.
- Adding authentication/rate-limiting to `/api/brag`.
- Surfacing `actionTaken` in the UI (not currently rendered).

## Decisions

- **Map at the service boundary (decision 1).** `generateBrag` maps the flow response into the existing `Brag` interface rather than changing the interface to match the flow. Mapping: `impact ← businessImpact`, `technologies ← technologiesUsed`, `rawInput ← definition` (the input sent), `createdAt ← new Date()`, `id/title/context/metrics` copied as-is. `actionTaken` is dropped (the UI does not render it).
  - *Alternative considered:* change the `Brag` interface to match `BragSchema` (rename `impact`→`businessImpact`, `technologies`→`technologiesUsed`, add `actionTaken`, drop `rawInput`/`createdAt`). Rejected — it ripples into both templates and discards already-used field names with no UI benefit.

- **Read the `brag` wrapper (decision 2).** The server returns `{ brag: <BragSchema> }`, so the service maps `response.brag`, not the whole body. This matches the already-implemented `server.ts`.

- **Reuse existing `provideHttpClient(withFetch())` (decision 3).** Already present in `app.config.ts`; `withFetch()` is SSR-safe and requires no change. The service simply injects `HttpClient` via the constructor.

- **Guard + finally semantics (decision 4).** `generateBrag` sets `loading` true and `error` null up front, performs the POST, prepends the mapped brag to the `brags` signal, and resets `loading` false in a `finally` block. On error it sets the `error` signal and rethrows so the component can react.

- **Server route is already correct (decision 5).** `server.ts` already has `express.json()`, the `/api/brag` route before the Angular catch-all, `bragGeneratorFlow.run({ definition })`, JSON response, and 500/400 handling. No edit required; it is listed only for verification.

## Risks / Trade-offs

- **Missing Genkit/Google AI key at runtime** → `/api/brag` returns 500. → *Mitigation:* client catches, sets `error` signal, and turns `loading` off; document the `.env` requirement. App build and load are unaffected.
- **Response shape drift** if `BragSchema` changes later → mapping breaks silently. → *Mitigation:* mapping is isolated in one service method; a build/type error or a test on the mapping catches drift.
- **SSR + HTTP** → *Mitigation:* `withFetch()` is already configured, so `HttpClient` works during server rendering without `xhr`/browser-only APIs.
- **Trade-off:** dropping `actionTaken` means that flow field is not shown. Acceptable for now since no template renders it.

## Migration Plan

1. Verify `server.ts` and `app.config.ts` already satisfy the target (no edits).
2. Rewrite `BragService` to remove mocks and add `generateBrag` with mapping.
3. Swap the dashboard call site to `generateBrag`.
4. Run `npm run build`; fix errors until green.
5. (Optional manual) `npm run serve:ssr:brag-bot` + POST `/api/brag` with a `.env` key to confirm a real brag renders.

**Rollback:** the change is additive (mock removal); revert the service + dashboard files and the build to restore mock behavior.

## Open Questions

- Should `actionTaken` be surfaced in the details view? Out of scope for this change; can be added later by extending the `Brag` interface and template.
