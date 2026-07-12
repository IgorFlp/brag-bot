## Context

The brag-bot project is an Angular 21 application using the UNIPDS design system with Firebase Genkit for AI-powered features. This change introduces a Genkit flow that transforms informal user descriptions of work achievements into structured "Brag Documents" for career development and performance reviews.

Currently, the project has Genkit configured (per recent commits) but lacks the specific flow for brag document generation. The flow needs to be implemented as a TypeScript file (`src/flows.ts`) that exports a `bragGeneratorFlow` using the Genkit framework with Google AI (Gemini) plugin.

## Goals / Non-Goals

**Goals:**
- Create a Genkit flow `bragGeneratorFlow` that accepts informal text input and returns a structured Brag Document
- Configure Genkit with Google AI plugin using `gemini-flash-latest` model at temperature 0.8
- Define Zod schemas (`BragInputSchema` and `BragSchema`) with descriptive field annotations for LLM guidance
- Implement prompt engineering with persona as "Senior Career Consultant" focused on IDPs for Software Engineers
- Support both Portuguese and English inputs/outputs (matching input language)
- Infer metrics and technologies when not explicitly provided
- Validate output against schema and generate UUID v4 for the `id` field
- Throw descriptive errors on validation failure

**Non-Goals:**
- Building the UI/frontend integration (handled separately)
- Authentication or user management
- Persistence/storage of generated brag documents
- Batch processing or queue-based generation
- Streaming/real-time responses

## Decisions

### 1. File Structure: Single `src/flows.ts` file
**Decision**: Place all Genkit configuration, schemas, and flow definition in a single `src/flows.ts` file.
**Rationale**: The flow is self-contained with no external dependencies beyond Genkit and uuid. A single file keeps the implementation simple and discoverable. This aligns with Genkit's recommended patterns for small flows.
**Alternative Considered**: Separate files for schemas, config, and flow. Rejected as over-engineering for a single flow.

### 2. Genkit Initialization Pattern
**Decision**: Initialize Genkit at module level with `googleAI` plugin and default model configuration.
**Rationale**: Module-level initialization ensures the AI instance is configured once and reused. The `gemini-flash-latest` model at temperature 0.8 balances creativity with consistency for structured output generation.
**Alternative Considered**: Lazy initialization inside flow. Rejected as Genkit recommends initializing once.

### 3. Schema Design with Zod `describe()`
**Decision**: Use Zod's `.describe()` on every field to provide semantic guidance to the LLM.
**Rationale**: Genkit uses Zod schemas for both validation and prompt construction. Descriptions improve output quality by giving the model clear semantic expectations for each field.
**Alternative Considered**: Plain Zod schemas without descriptions. Rejected as it reduces output quality.

### 4. Prompt Engineering Strategy
**Decision**: Construct a comprehensive system prompt as a template string with embedded instructions for persona, rules, and language handling.
**Rationale**: The prompt needs to encode complex behavioral rules (persona, tone, metric inference, language matching). A template string allows clear organization and easy modification.
**Alternative Considered**: Few-shot examples in prompt. Rejected as the schema + descriptions provide sufficient structure for this structured output task.

### 5. Output Validation and UUID Generation
**Decision**: Validate AI output against `BragSchema` using Genkit's built-in schema validation, then manually add UUID v4 to the validated result.
**Rationale**: Genkit's `ai.generate()` with `output: { schema: BragSchema }` handles validation automatically. Adding UUID post-validation ensures every document has a unique identifier without requiring the LLM to generate one.
**Alternative Considered**: Include UUID in schema and let LLM generate. Rejected as LLMs cannot reliably generate valid UUIDs.

### 6. Language Handling
**Decision**: Instruct the model to match the input language in the output via prompt instruction (Rule 4).
**Rationale**: Genkit doesn't have built-in language detection. Prompt-based instruction is the standard approach for multilingual LLM outputs.
**Alternative Considered**: Pre-detect language and pass as parameter. Rejected as it adds complexity without significant benefit.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| LLM outputs invalid JSON despite schema | Genkit validates output; throw descriptive error on failure |
| Metric inference produces unrealistic numbers | Prompt instructs "infer nature of metric" not specific values; user can edit |
| Language mismatch in multilingual inputs | Prompt explicitly requires matching input language; fallback to English if ambiguous |
| Google AI API rate limits/errors | Not handled in this flow; should be addressed at application level with retry logic |
| Temperature 0.8 may produce inconsistent structure | Schema validation catches structural issues; temperature balanced for creativity + consistency |