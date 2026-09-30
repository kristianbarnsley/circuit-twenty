import { describe, expect, it } from 'vitest';
import type { Session } from '../domain/types';
import { fmtUnitsDelta, pacePerRound, summarize, totalReps, weekStreak } from './stats';

const DAY = 86_400_000;
function s(p: Partial<Session>): Session {
  return {
    id: Math.random().toString(), createdAt: Date.now(), updatedAt: Date.now(), equipment: [], seed: 0,
    durationSec: 1200, rounds: 6, partial: 2, effort: 2, notes: '',
    exercises: [
      { exerciseId: 'a', name: 'A', reps: 10 },
      { exerciseId: 'b', name: 'B', reps: 8 },
      { exerciseId: 'c', name: 'C', reps: 10 },
    ],
    ...p,
  };
}

describe('stats', () => {
  it('totals reps including the partial round', () => {
    // 7×10 + 7×8 + 6×10 — matches the Submit mockup
    expect(totalReps(s({}))).toBe(186);
  });
  it('computes pace per round', () => {
    expect(pacePerRound(s({ rounds: 5, partial: 0 }))).toBe('4:00');
  });
  it('formats deltas', () => {
    expect(fmtUnitsDelta(3)).toBe('+1 rd');
    expect(fmtUnitsDelta(-2)).toBe('-2 ex');
    expect(fmtUnitsDelta(4)).toBe('+1.3');
    expect(fmtUnitsDelta(0)).toBe('=');
  });
  it('counts week streaks', () => {
    const now = new Date('2026-09-30T12:00:00').getTime(); // Wednesday
    const list = [s({ createdAt: now - DAY }), s({ createdAt: now - 8 * DAY }), s({ createdAt: now - 15 * DAY })];
    expect(weekStreak(list, now)).toBe(3);
    expect(weekStreak([s({ createdAt: now - 8 * DAY })], now)).toBe(1);
    expect(weekStreak([s({ createdAt: now - 20 * DAY })], now)).toBe(0);
  });
  it('summarizes', () => {
    const sum = summarize([s({ rounds: 5, partial: 0 }), s({ rounds: 7, partial: 0 })]);
    expect(sum.count).toBe(2);
    expect(sum.best?.rounds).toBe(7);
    expect(sum.avgRounds).toBe(6);
  });
});
