## Context

The brag-bot project is an Angular 21 application with SSR support that integrates with Genkit for AI-powered brag generation. Currently, the `BragService` uses mock data for demonstration purposes. The project already has Genkit dependencies installed (`genkit`, `@genkit-ai/google-genai`) and a `.genkit` directory for runtime management.

The existing architecture:
- **server.ts**: Express server handling SSR and static assets
- **brag.service.ts**: Service with mock data and `generateMockBrag()` method
- **app.config.ts**: Angular application configuration

**Key constraint**: The `bragGeneratorFlow` flow definition needs to be created in the server context since it's invoked from `server.ts`.

## Goals / Non-Goals

**Goals:**
- Integrate Genkit flow (`bragGeneratorFlow`) with Express backend
- Replace mock data generation with real AI-powered brag generation
- Implement proper HTTP API endpoint at `/api/brag`
- Enable SSR-compatible HttpClient with `withFetch()`
- Ensure build passes without TypeScript errors

**Non-Goals:**
- Do not modify the frontend UI components
- Do not create new design system components
- Do not modify routing configuration

## Decisions

### Decision 1: Flow Definition Location
**Choice**: Define `bragGeneratorFlow` in `server.ts` alongside the Express app.

**Rationale**: The server.ts is the entry point for the SSR backend and already imports Genkit types. This keeps the flow definition close to where it's invoked, avoiding circular dependencies between client and server code.

### Decision 2: HttpClient Configuration
**Choice**: Use `provideHttpClient(withFetch())` in `app.config.ts`

**Rationale**: The instructions explicitly require this for SSR compatibility. The `withFetch()` ensures the HttpClient uses the Fetch API, which is required for server-side rendering.

### Decision 3: API Endpoint Design
**Choice**: `POST /api/brag` with JSON body `{definition: string}`

**Rationale**: The instructions specify this exact interface. Using POST allows for request body payload, and the simple structure matches the Genkit flow input.

### Decision 4: Error Handling
**Choice**: Return HTTP 500 with JSON error message on flow invocation failure

**Rationale**: This provides clear error feedback to the client while following REST conventions for server errors.

## Risks / Trade-offs

- **[Risk]**: Flow not found at runtime → **Mitigation**: Ensure flow is defined before route handler is registered
- **[Risk]**: SSR build failure due to server/client boundary → **Mitigation**: Import flow only in server.ts (server entry point)
- **[Risk]**: Missing HTTP client configuration → **Mitigation**: Add `withFetch()` provider as instructed
- **[Risk]**: TypeScript compilation errors → **Mitigation**: Follow exact import patterns from Genkit docs

## Migration Plan

1. Add `bragGeneratorFlow` definition to `server.ts` using Genkit's `defineFlow` pattern
2. Configure Express JSON body parser: `server.use(express.json())`
3. Create POST `/api/brag` route that invokes the flow
4. Update `app.config.ts` to provide HttpClient with `withFetch()`
5. Refactor `brag.service.ts` to use real HTTP calls instead of mocks
6. Run `npm run build` and fix any compilation errors
7. Verify SSR works correctly with the new configuration

## Open Questions

- What model should `bragGeneratorFlow` use? (Default: `googleAI.model('gemini-2.5-flash')`)
- What is the expected output schema for the brag response?