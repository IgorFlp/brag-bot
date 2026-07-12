## ADDED Requirements

### Requirement: Server exposes brag generation endpoint
The system SHALL expose `POST /api/brag` that accepts a JSON body containing a `definition` string, invokes `bragGeneratorFlow` with `{ definition }`, and returns the generated brag document as JSON under the `brag` key. On generation failure it SHALL return HTTP 500 with an error object. If `definition` is missing or empty it SHALL return HTTP 400 with an error object.

#### Scenario: Successful generation
- **WHEN** a client POSTs `{ "definition": "<informal achievement text>" }` to `/api/brag`
- **THEN** the server returns HTTP 200 with body `{ "brag": { "title", "context", "actionTaken", "businessImpact", "metrics", "technologiesUsed", "id" } }`

#### Scenario: Missing definition
- **WHEN** a client POSTs a body without a `definition` field (or an empty one)
- **THEN** the server returns HTTP 400 with an error object

#### Scenario: Generation failure
- **WHEN** `bragGeneratorFlow` throws during execution
- **THEN** the server returns HTTP 500 with an error object and does not crash

### Requirement: Frontend consumes brag generation via HTTP
The `BragService` SHALL remove all mock data and generate real brags by POSTing the `definition` to `/api/brag` using `HttpClient` (provided via `provideHttpClient(withFetch())`). It SHALL map the flow response into the Angular `Brag` interface (`impact` ← `businessImpact`, `technologies` ← `technologiesUsed`, `rawInput` ← the sent `definition`, `createdAt` set to the current time, `id`/`title`/`context`/`metrics` preserved) and prepend the mapped brag to the `brags` signal. It SHALL set `loading` to true before the request and false afterward (in a `finally` block), and set the `error` signal when the request fails.

#### Scenario: Successful generateBrag
- **WHEN** `generateBrag(definition)` is called with a non-empty string
- **THEN** `loading` becomes true, a POST to `/api/brag` is sent with `{ "definition" }`, the returned `brag` is mapped and added to the front of `brags`, and `loading` becomes false

#### Scenario: Generation error handled
- **WHEN** the POST to `/api/brag` fails (network or non-2xx response)
- **THEN** `loading` becomes false, the `error` signal is set with a message, and no brag is added to the list

#### Scenario: Empty definition rejected
- **WHEN** `generateBrag` is called with an empty or whitespace-only string
- **THEN** no request is sent and the `error` signal is set

### Requirement: Application builds successfully with SSR
After the integration, the application SHALL build without TypeScript, SSR, or dependency errors via `ng build`.

#### Scenario: Clean production build
- **WHEN** `npm run build` is executed after the changes
- **THEN** the build completes and emits the browser and server bundles with no errors
