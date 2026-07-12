import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

// Genkit configuration with Google AI plugin.
// The default model is set here (Decision 2) so every generation uses
// gemini-flash-latest unless overridden. Temperature (0.8) is applied per
// call in ai.generate, as GenkitOptions does not accept a default config.
export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-flash-latest'),
});

// Schema definitions
export const BragInputSchema = z.object({
  definition: z
    .string()
    .describe('The informal draft or bullet points describing the achievement to transform into a Brag Document'),
});

export const BragSchema = z.object({
  title: z.string().describe('Concise, professional title summarizing the achievement'),
  context: z.string().describe('Background context: what was the situation, problem, or opportunity'),
  actionTaken: z.string().describe('Specific actions taken by the individual to address the situation'),
  businessImpact: z.string().describe('Measurable business impact or outcome achieved'),
  metrics: z
    .array(z.string())
    .describe('Key metrics or KPIs demonstrating impact (inferred if not explicitly provided)'),
  technologiesUsed: z.array(z.string()).describe('Technologies, tools, or frameworks utilized'),
  id: z.string().uuid().describe('Unique identifier for the brag document (UUID v4)'),
});

// Flow implementation
export const bragGeneratorFlow = ai.defineFlow(
  {
    name: 'bragGeneratorFlow',
    inputSchema: BragInputSchema,
    outputSchema: BragSchema,
  },
  async (input) => {
    const prompt = `You are a Senior Career Consultant specializing in creating Individual Development Plans (IDPs) for Software Engineers.

Your objective is to transform an informal draft or bullet points into a polished, executive-ready Brag Document that highlights professional impact.

Rules:
1. Tone: Professional, objective, and impact-focused. Avoid emotional adjectives. Use active voice.
2. Metrics: If exact metrics are not provided, infer the nature of the metric (e.g., "reduced latency by ~40%", "increased throughput 2x", "saved ~20h/month"). Do not invent specific numbers without basis.
3. Format: Output MUST strictly follow the BragSchema JSON format. Do not include any extra fields, markdown, or commentary.
4. Language: Match the input language in the output (Portuguese or English). If ambiguous, default to English.

Input to transform:
${input.definition}`;

    const { output } = await ai.generate({
      prompt,
      config: {
        temperature: 0.8,
      },
      output: {
        schema: BragSchema.omit({ id: true }),
      },
    });

    if (!output) {
      throw new Error('Failed to generate Brag Document: model returned no output');
    }

    // Add UUID v4 to the output
    const result = {
      ...output,
      id: uuidv4(),
    };

    return result;
  }
);