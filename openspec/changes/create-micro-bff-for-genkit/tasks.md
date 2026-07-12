## 1. Verify Existing Backend & HTTP Config

- [x] 1.1 Confirm `src/server.ts` has `express.json()`, a `POST /api/brag` route before the Angular catch-all that calls `bragGeneratorFlow.run({ definition })`, returns `{ brag }` as JSON, and returns 500 (and 400 on missing `definition`). Mark as verified; no edit expected.
- [x] 1.2 Confirm `src/app/app.config.ts` provides `provideHttpClient(withFetch())`. Mark as verified; no edit expected.

## 2. Implement the Real BragService

- [x] 2.1 Remove `loadMockData()` and `generateMockBrag(prompt)` from `BragService`, and remove the unused `GenerateBragRequest` interface.
- [x] 2.2 Inject `HttpClient` into the `BragService` constructor.
- [x] 2.3 Implement `generateBrag(definition: string)`: set `loading` true and `error` null; POST `{ definition }` to `/api/brag`; map `response.brag` → `Brag` (`impact` ← `businessImpact`, `technologies` ← `technologiesUsed`, `rawInput` ← `definition`, `createdAt` ← `new Date()`, copy `id`/`title`/`context`/`metrics`); prepend to the `_brags` signal; `finally` set `loading` false; on error set the `error` signal and rethrow.
- [x] 2.4 Guard against empty/whitespace-only `definition`: skip the request and set the `error` signal.

## 3. Wire the Dashboard Call Site

- [x] 3.1 In `DashboardComponent.onGenerate()`, replace `this.bragService.generateMockBrag(prompt)` with `this.bragService.generateBrag(prompt)`; keep navigation to the returned brag's detail view by its `id`.

## 4. Build Validation (Critical)

- [x] 4.1 Run `npm run build` from the project root.
- [x] 4.2 Inspect terminal output; fix any TypeScript, SSR, or dependency errors in the changed files until the build completes with no errors.
