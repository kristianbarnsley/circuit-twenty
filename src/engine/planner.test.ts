import { describe, expect, it } from 'vitest';
import { EXERCISES, exercisePool } from '../data/exercises';
import { MUSCLES, type Exercise, type Session } from '../domain/types';
import { buildHistoryState, EMPTY_HISTORY } from './history';
import { generate, isValidCombo, scoreCombo, swap } from './planner';
import { rng } from './rng';

const ALL = exercisePool(['mat', 'dumbbells', 'cable1', 'cable2', 'pullupBar']);

describe('exercise DB', () => {
  it('has unique ids and sane values', () => {
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length);
    for (const e of EXERCISES) {
      expect(e.defaultReps).toBeGreaterThan(0);
      for (const [m, v] of Object.entries(e.muscles)) {
        expect(MUSCLES).toContain(m);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('equipment filtering', () => {
  it('bodyweight only includes no-equipment moves', () => {
    expect(exercisePool([]).every((e) => e.equipment.length === 0)).toBe(true);
  });
  it('cable x2 implies cable x1', () => {
    expect(exercisePool(['cable2']).some((e) => e.equipment.includes('cable1'))).toBe(true);
  });
});

describe('generate', () => {
  const setups: Parameters<typeof exercisePool>[0][] = [[], ['mat'], ['dumbbells'], ['pullupBar'], ['cable1'], ['mat', 'dumbbells', 'pullupBar']];

  it('always yields a valid combo from available equipment', () => {
    for (const eq of setups) {
      const pool = exercisePool(eq);
      const ids = new Set(pool.map((e) => e.id));
      for (let seed = 0; seed < 50; seed++) {
        const w = generate(pool, EMPTY_HISTORY, seed)!;
        expect(w).toHaveLength(3);
        expect(isValidCombo(w)).toBe(true);
        w.forEach((e) => expect(ids.has(e.id)).toBe(true));
      }
    }
  });

  it('is deterministic per seed', () => {
    const a = generate(ALL, EMPTY_HISTORY, 1234)!.map((e) => e.id);
    const b = generate(ALL, EMPTY_HISTORY, 1234)!.map((e) => e.id);
    expect(a).toEqual(b);
  });

  it('gives variety across seeds', () => {
    const seen = new Set<string>();
    for (let s = 0; s < 40; s++) seen.add(generate(ALL, EMPTY_HISTORY, s)!.map((e) => e.id).join());
    expect(seen.size).toBeGreaterThan(5);
  });

  it('beats random valid combos on average', () => {
    const r = rng(7);
    let gen = 0, rand = 0, n = 0;
    for (let s = 0; s < 100; s++) {
      gen += scoreCombo(generate(ALL, EMPTY_HISTORY, s)!, EMPTY_HISTORY);
      let c: Exercise[];
      do { c = [0, 0, 0].map(() => ALL[Math.floor(r() * ALL.length)]); } while (!isValidCombo(c));
      rand += scoreCombo(c, EMPTY_HISTORY);
      n++;
    }
    expect(gen / n).toBeGreaterThan(rand / n);
  });

  it('biases away from recently trained muscles', () => {
    const now = Date.now();
    const legDay: Session = {
      id: 'x', createdAt: now - 3_600_000, updatedAt: now, equipment: [], seed: 0, durationSec: 1200,
      rounds: 5, partial: 0, effort: 2, notes: '',
      exercises: ['air-squat', 'jump-lunge', 'jump-squat'].map((id) => ({ exerciseId: id, name: id, reps: 10 })),
    };
    const hist = buildHistoryState([legDay], now);
    expect(hist.deficit.quads).toBeLessThan(hist.deficit.chest);
    expect(hist.recent.has('air-squat')).toBe(true);
  });
});

describe('swap', () => {
  it('never returns excluded or current exercises and keeps the combo valid', () => {
    for (let seed = 0; seed < 30; seed++) {
      const w = generate(ALL, EMPTY_HISTORY, seed)!;
      const excluded = [w[1].id];
      const repl = swap(ALL, EMPTY_HISTORY, w, 1, excluded, seed + 1)!;
      expect(repl).toBeTruthy();
      expect(w.map((e) => e.id)).not.toContain(repl.id);
      const next = [...w];
      next[1] = repl;
      expect(isValidCombo(next)).toBe(true);
    }
  });
});
