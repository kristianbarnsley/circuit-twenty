import type { Exercise, Muscle, Pattern, Region } from '../domain/types';
import type { HistoryState } from './history';
import { rng } from './rng';

/** Tuning knobs for combo scoring. */
export const PLANNER_WEIGHTS = {
  /** Full-body coverage — the primary goal. */
  coverage: 1.0,
  /** Bias toward muscles that are under-trained recently. */
  balance: 0.5,
  /** Penalty for piling too much onto one muscle. */
  overlap: 0.8,
  /** Penalty per exercise used in the last couple of sessions. */
  recency: 0.4,
  /** A muscle is "saturated" above this summed impact. */
  overlapCap: 1.2,
  /** Pick randomly among this many best combos. */
  topK: 25,
  /** Softmax temperature for that pick — lower = greedier. */
  temperature: 0.6,
};

/** Big muscle groups matter more for "full body". */
const MUSCLE_WEIGHT: Record<Muscle, number> = {
  quads: 1, glutes: 1, hamstrings: 0.8, chest: 1, shoulders: 1, triceps: 0.6, back: 1, biceps: 0.5, core: 0.8,
};

/** Movement families — at most one exercise from each per workout. */
const FAMILY: Partial<Record<Pattern, string>> = {
  squat: 'legs', hinge: 'legs', lunge: 'legs', pushH: 'push', pushV: 'push', pullH: 'pull', pullV: 'pull',
};

const REGION_ORDER: Record<Region, number> = { full: 0, lower: 1, upper: 2, core: 3 };

export function isValidCombo(exs: Exercise[]): boolean {
  const patterns = new Set(exs.map((e) => e.pattern));
  if (patterns.size !== exs.length) return false;
  const families = exs.map((e) => FAMILY[e.pattern]).filter(Boolean);
  if (new Set(families).size !== families.length) return false;
  // Cindy-style: at most one full-body complex, the rest are distinct movements.
  if (exs.filter((e) => e.region === 'full').length > 1) return false;
  const lower = exs.some((e) => e.region === 'lower' || e.region === 'full');
  const upper = exs.some((e) => e.region === 'upper' || e.region === 'full');
  return lower && upper;
}

export function scoreCombo(exs: Exercise[], hist: HistoryState): number {
  const w = PLANNER_WEIGHTS;
  const sum: Partial<Record<Muscle, number>> = {};
  for (const e of exs) {
    for (const [m, v] of Object.entries(e.muscles) as [Muscle, number][]) sum[m] = (sum[m] ?? 0) + v;
  }
  let coverage = 0, balance = 0, overlap = 0;
  for (const [m, v] of Object.entries(sum) as [Muscle, number][]) {
    const hit = Math.min(1, v) * MUSCLE_WEIGHT[m];
    coverage += hit;
    balance += hit * hist.deficit[m];
    overlap += Math.max(0, v - w.overlapCap);
  }
  const recency = exs.filter((e) => hist.recent.has(e.id)).length;
  return w.coverage * coverage + w.balance * balance - w.overlap * overlap - w.recency * recency;
}

function softmaxPick<T>(items: { item: T; score: number }[], rand: () => number): T | null {
  if (!items.length) return null;
  const top = [...items].sort((a, b) => b.score - a.score).slice(0, PLANNER_WEIGHTS.topK);
  const best = top[0].score;
  const weights = top.map((t) => Math.exp((t.score - best) / PLANNER_WEIGHTS.temperature));
  let r = rand() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < top.length; i++) {
    r -= weights[i];
    if (r <= 0) return top[i].item;
  }
  return top[top.length - 1].item;
}

export function orderForFlow(exs: Exercise[]): Exercise[] {
  return [...exs].sort((a, b) => REGION_ORDER[a.region] - REGION_ORDER[b.region]);
}

/** Pick 3 exercises from the pool. Returns null if no valid combo exists. */
export function generate(pool: Exercise[], hist: HistoryState, seed: number, excluded: string[] = []): Exercise[] | null {
  const p = pool.filter((e) => !excluded.includes(e.id));
  const combos: { item: Exercise[]; score: number }[] = [];
  for (let i = 0; i < p.length; i++)
    for (let j = i + 1; j < p.length; j++)
      for (let k = j + 1; k < p.length; k++) {
        const c = [p[i], p[j], p[k]];
        if (isValidCombo(c)) combos.push({ item: c, score: scoreCombo(c, hist) });
      }
  const pick = softmaxPick(combos, rng(seed));
  return pick ? orderForFlow(pick) : null;
}

/**
 * Replace the exercise in `slot`, keeping the other two. Never returns an
 * excluded id or one already in the workout. Returns null if nothing fits.
 */
export function swap(
  pool: Exercise[], hist: HistoryState, current: Exercise[], slot: number, excluded: string[], seed: number,
): Exercise | null {
  const keep = current.filter((_, i) => i !== slot);
  const taken = new Set([...current.map((e) => e.id), ...excluded]);
  const candidates = pool
    .filter((e) => !taken.has(e.id))
    .map((e) => {
      const combo = [...keep];
      combo.splice(slot, 0, e);
      return { item: e, combo };
    })
    .filter((c) => isValidCombo(c.combo))
    .map((c) => ({ item: c.item, score: scoreCombo(c.combo, hist) }));
  return softmaxPick(candidates, rng(seed));
}
