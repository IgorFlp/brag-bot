## 1. Project Setup & Dependencies

- [x] 1.1 Verify Genkit and Google AI dependencies are installed in package.json
- [x] 1.2 Verify uuid package is installed for UUID v4 generation
- [x] 1.3 Verify TypeScript configuration supports Genkit decorators/patterns

## 2. Schema Definitions

- [x] 2.1 Create `BragInputSchema` with `definition` string field using Zod with describe()
- [x] 2.2 Create `BragSchema` with all required fields (title, context, actionTaken, businessImpact, metrics, technologiesUsed) using Zod with describe()
- [x] 2.3 Export both schemas from flows.ts

## 3. Genkit Configuration

- [x] 3.1 Import genkit, z from 'genkit'
- [x] 3.2 Import googleAI from '@genkit-ai/googlegenai'
- [x] 3.3 Import uuidv4 from 'uuid'
- [x] 3.4 Initialize Genkit instance with googleAI plugin and default model gemini-flash-latest at temperature 0.8
- [x] 3.5 Export the configured `ai` instance

## 4. Flow Implementation

- [x] 4.1 Create and export `bragGeneratorFlow` using `ai.defineFlow`
- [x] 4.2 Configure flow input schema as `BragInputSchema` and output schema as `BragSchema`
- [x] 4.3 Build comprehensive prompt string with:
  - Persona: Senior Career Consultant focused on IDPs for Software Engineers
  - Objective: Transform informal draft into executive Brag Document
  - Rule 1: Professional, objective, impact-focused tone without emotional adjectives
  - Rule 2: Infer metric nature when exact metrics not provided
  - Rule 3: Strictly follow BragSchema JSON format
  - Rule 4: Match input language in output (Portuguese/English)
  - Append input.definition at the end
- [x] 4.4 Call `ai.generate` with prompt and output schema validation
- [x] 4.5 Validate output exists; throw Error if invalid/missing
- [x] 4.6 Add `id` field with `uuidv4()` to validated output
- [x] 4.7 Return complete Brag Document with all fields plus id

## 5. Testing & Verification

- [x] 5.1 Verify TypeScript compiles without errors
- [x] 5.2 Test flow with Portuguese input (manual or automated)
- [x] 5.3 Test flow with English input (manual or automated)
- [x] 5.4 Test flow handles missing metrics (inference)
- [x] 5.5 Test flow handles missing technologies (inference)
- [x] 5.6 Test flow throws error on invalid output
- [x] 5.7 Verify UUID v4 is generated and included in output