import { EXERCISE_BY_ID } from '../data/exercises';
import { MUSCLES, type Muscle, type Session } from '../domain/types';

/** Summary of past sessions that the planner and Generate screen consume. */
export interface HistoryState {
  /** 0 = heavily trained recently, 1 = untouched recently. */
  deficit: Record<Muscle, number>;
  /** Exercise ids used in the most recent sessions. */
  recent: Set<string>;
  /** Last kg logged per exercise id. */
  lastKg: Record<string, number>;
}

const WINDOW_DAYS = 14;
const HALF_LIFE_DAYS = 4;
const RECENT_SESSIONS = 2;
const DAY_MS = 86_400_000;

export const EMPTY_HISTORY: HistoryState = {
  deficit: Object.fromEntries(MUSCLES.map((m) => [m, 1])) as Record<Muscle, number>,
  recent: new Set(),
  lastKg: {},
};

export function buildHistoryState(sessions: Session[], now = Date.now()): HistoryState {
  const live = sessions.filter((s) => !s.deletedAt).sort((a, b) => b.createdAt - a.createdAt);

  const load = Object.fromEntries(MUSCLES.map((m) => [m, 0])) as Record<Muscle, number>;
  for (const s of live) {
    const ageDays = (now - s.createdAt) / DAY_MS;
    if (ageDays > WINDOW_DAYS) break;
    const decay = Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
    for (const se of s.exercises) {
      const ex = EXERCISE_BY_ID[se.exerciseId];
      if (!ex) continue;
      for (const [m, v] of Object.entries(ex.muscles) as [Muscle, number][]) load[m] += v * decay;
    }
  }
  const max = Math.max(...Object.values(load));
  const deficit = Object.fromEntries(
    MUSCLES.map((m) => [m, max > 0 ? 1 - load[m] / max : 1]),
  ) as Record<Muscle, number>;

  const recent = new Set(live.slice(0, RECENT_SESSIONS).flatMap((s) => s.exercises.map((e) => e.exerciseId)));

  const lastKg: Record<string, number> = {};
  for (const s of live) {
    for (const e of s.exercises) {
      if (e.kg !== undefined && lastKg[e.exerciseId] === undefined) lastKg[e.exerciseId] = e.kg;
    }
  }

  return { deficit, recent, lastKg };
}
