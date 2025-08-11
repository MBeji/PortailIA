import { describe, it, expect } from 'vitest';
import { generateRecommendations } from '../lib/recommendations';
import { phaseFromPriority } from '../lib/plan';

describe('generateRecommendations', () => {
  it('generates default rule when unknown questionId', () => {
    const recs = generateRecommendations('finance', [{ questionId: 'finance.unknown', level: 1, weight: 2 }]);
    expect(recs).toHaveLength(1);
    expect(recs[0].title).toMatch(/Amélioration/);
    expect(recs[0].priority).toBeGreaterThan(0);
  });
  it('sorts by priority desc', () => {
    const recs = generateRecommendations('rh', [
      { questionId: 'rh.training', level: 1, weight: 1 },
      { questionId: 'foo.bar', level: 1, weight: 5 }
    ]);
    // second will have weight 5 priority, should come first
    expect(recs[0].questionId).toBe('foo.bar');
  });
});

describe('phaseFromPriority', () => {
  it('maps priority thresholds', () => {
    expect(phaseFromPriority(20)).toBe('Court terme');
    expect(phaseFromPriority(10)).toBe('Moyen terme');
    expect(phaseFromPriority(5)).toBe('Long terme');
  });
});
