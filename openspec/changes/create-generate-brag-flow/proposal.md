## Why

The brag-bot application needs a Genkit flow to transform informal user drafts about their work achievements into professional, structured "Brag Documents" that can be used for performance reviews, IDPs (Individual Development Plans), and career progression documentation. Currently, there's no AI-powered capability to automatically structure these informal notes into a standardized format with proper technical context, business impact, and quantifiable metrics.

## What Changes

- Create a new Genkit flow (`bragGeneratorFlow`) that accepts informal text input and returns a structured Brag Document
- Define Zod schemas for input (`BragInputSchema`) and output (`BragSchema`) with comprehensive field descriptions
- Configure Genkit with Google AI plugin using `gemini-flash-latest` model at temperature 0.8
- Add UUID generation for unique document identification

## Capabilities

### New Capabilities
- `generate-brag-document`: AI-powered transformation of informal achievement drafts into structured executive brag documents with title, context, action taken, business impact, metrics, and technologies used

### Modified Capabilities
- None (this is a new capability)

## Impact

- New file: `src/flows.ts` containing Genkit configuration, schemas, and flow definition
- New dependencies: `genkit`, `@genkit-ai/googlegenai`, `uuid` (if not already present)
- Integration point for frontend to call the flow via Genkit runtime
- No breaking changes to existing functionality