import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ai, bragGeneratorFlow} from './flows';

type Brag = Awaited<ReturnType<typeof bragGeneratorFlow.run>>['result'];

function makeBrag(overrides: Partial<Brag> = {}): Brag {
  return {
    title: 'Improved CI pipeline',
    context: 'Build times were slow and blocking developers.',
    actionTaken: 'Introduced caching and parallel jobs.',
    businessImpact: 'Faster feedback loop for the whole team.',
    metrics: ['Reduced build time'],
    technologiesUsed: ['GitHub Actions'],
    ...overrides,
  } as Brag;
}

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('bragGeneratorFlow', () => {
  let spy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    spy = vi
      .spyOn(ai, 'generate')
      .mockImplementation(async () => ({ output: makeBrag() }) as any);
  });

  afterEach(() => {
    spy.mockRestore();
  });

  // 5.2 - Portuguese input
  it('returns a Brag Document with all required fields for Portuguese input', async () => {
    const { result } = await bragGeneratorFlow.run({
      definition: 'Implementei um pipeline de CI que reduziu o tempo de build.',
    });
    expect(result.title).toBeTruthy();
    expect(result.context).toBeTruthy();
    expect(result.actionTaken).toBeTruthy();
    expect(result.businessImpact).toBeTruthy();
    expect(Array.isArray(result.metrics)).toBe(true);
    expect(Array.isArray(result.technologiesUsed)).toBe(true);
    expect(result.id).toBeDefined();
  });

  // 5.3 - English input
  it('returns a Brag Document with all required fields for English input', async () => {
    const { result } = await bragGeneratorFlow.run({
      definition: 'Built a caching layer that cut p99 latency.',
    });
    expect(result.title).toBeTruthy();
    expect(result.id).toBeDefined();
  });

  // 5.4 - missing metrics (inference) does not crash
  it('handles missing metrics by passing through inferred/empty metrics', async () => {
    const { result } = await bragGeneratorFlow.run({
      definition: 'Helped onboard new engineers.',
    });
    expect(Array.isArray(result.metrics)).toBe(true);
    expect(result.id).toBeDefined();
  });

  // 5.5 - missing technologies (inference) does not crash
  it('handles missing technologies by passing through inferred/empty list', async () => {
    const { result } = await bragGeneratorFlow.run({
      definition: 'Led a cross-team planning effort.',
    });
    expect(Array.isArray(result.technologiesUsed)).toBe(true);
    expect(result.id).toBeDefined();
  });

  // 5.6 - error on invalid/missing output
  it('throws an error when the model returns no output', async () => {
    spy.mockImplementation(async () => ({ output: null }) as any);
    await expect(
      bragGeneratorFlow.run({ definition: 'Some achievement' }),
    ).rejects.toThrow();
  });

  // 5.7 - UUID v4 generated and included
  it('generates a valid UUID v4 as the id field', async () => {
    const { result } = await bragGeneratorFlow.run({
      definition: 'Shipped a feature flag system.',
    });
    expect(result.id).toMatch(UUID_V4_REGEX);
  });
});
