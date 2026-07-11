## 1. Backend Integration (server.ts)

- [ ] 1.1 Add Express JSON body parser middleware
- [ ] 1.2 Define bragGeneratorFlow with input/output schemas
- [ ] 1.3 Create POST /api/brag route handler
- [ ] 1.4 Add error handling with HTTP 500 response

## 2. Angular Configuration (app.config.ts)

- [ ] 2.1 Import provideHttpClient and withFetch
- [ ] 2.2 Add HttpClient provider to appConfig providers array

## 3. Service Refactoring (brag.service.ts)

- [ ] 3.1 Remove loadMockData() method and constructor call
- [ ] 3.2 Remove generateMockBrag() method
- [ ] 3.3 Inject HttpClient via constructor
- [ ] 3.4 Create generateBrag(definition: string) method
- [ ] 3.5 Implement loading signal management
- [ ] 3.6 Add error handling

## 4. Build Validation

- [ ] 4.1 Run npm run build
- [ ] 4.2 Fix any TypeScript compilation errors
- [ ] 4.3 Verify SSR build succeeds