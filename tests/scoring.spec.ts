import { describe, it, expect } from 'vitest';
import { computeDepartmentScore, qualitativeLevel } from '../lib/scoring';

describe('computeDepartmentScore', () => {
  it('returns 0 scores for empty input', () => {
    expect(computeDepartmentScore([])).toEqual({ score: 0, scorePercent: 0 });
  });
  it('computes weighted percent correctly', () => {
    const res = computeDepartmentScore([
      { weight: 2, level: 3, maxLevel: 5 },
      { weight: 1, level: 5, maxLevel: 5 }
    ]);
    // totalWeighted = 2*3 + 1*5 = 11; totalPossible = 2*5 + 1*5 = 15 => 73.33%
    expect(res.score).toBe(11);
    expect(res.scorePercent).toBeCloseTo(73.33, 1);
  });
  it('ignores N/A answers (negative level) from both numerator and denominator', () => {
    const res = computeDepartmentScore([
      { weight: 2, level: -1, maxLevel: 5 }, // N/A ignored
      { weight: 1, level: 5, maxLevel: 5 }
    ]);
    expect(res.score).toBe(5);
    expect(res.scorePercent).toBeCloseTo(100, 3);
  });
});

describe('qualitativeLevel', () => {
  const cases: [number, number][] = [
    [90,5],[70,4],[69.9,3],[55,3],[54.9,2],[40,2],[39.9,1],[25,1],[24.9,0]
  ];
  it('maps percent to qualitative level thresholds', () => {
    for (const [input, expected] of cases) {
      expect(qualitativeLevel(input)).toBe(expected);
    }
  });
});
