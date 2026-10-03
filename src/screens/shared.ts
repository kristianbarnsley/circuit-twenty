import { EQUIPMENT_TAG, EXERCISE_BY_ID } from '../data/exercises';
import type { Equipment, Exercise, SavedWorkout, SessionExercise, Slot } from '../domain/types';
import type { HistoryState } from '../engine/history';

export function makeSlot(e: Exercise, hist: HistoryState): Slot {
  return {
    exerciseId: e.id,
    reps: e.defaultReps,
    kg: e.defaultKg === undefined ? undefined : (hist.lastKg[e.id] ?? e.defaultKg),
  };
}

export function toSessionExercise(s: Slot): SessionExercise {
  return { exerciseId: s.exerciseId, name: EXERCISE_BY_ID[s.exerciseId]?.name ?? s.exerciseId, reps: s.reps, kg: s.kg };
}

/** Exercises of a saved workout, or null if any have since been removed from the exercise DB. */
export function savedExercises(w: SavedWorkout): Exercise[] | null {
  const exs = w.exerciseIds.map((id) => EXERCISE_BY_ID[id]);
  return exs.every(Boolean) ? exs : null;
}

export function workoutEquipment(exs: Exercise[]): Equipment[] {
  return [...new Set(exs.flatMap((e) => e.equipment))];
}

/** Saved workout with the same exercises, in any order. */
export function findSavedWorkout(saved: SavedWorkout[], exerciseIds: string[]): SavedWorkout | undefined {
  const key = (ids: string[]) => [...ids].sort().join('|');
  const k = key(exerciseIds);
  return saved.find((w) => key(w.exerciseIds) === k);
}

export function equipmentTags(eq: Equipment[]): string {
  return eq.length ? eq.map((q) => `#${EQUIPMENT_TAG[q]}`).join(' ') : '#bodyweight';
}

export function loadLabel(e: SessionExercise): string {
  const ex = EXERCISE_BY_ID[e.exerciseId];
  if (e.kg === undefined) return 'bodyweight';
  const note = ex?.loadNote;
  if (note === 'per dumbbell' || note === 'each stack') return `2×${e.kg} kg`;
  return `${e.kg} kg`;
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  // randomUUID is missing on insecure origins (e.g. testing over LAN http).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function fmtDate(ts: number): string {
  const d = new Date(ts);
  const wd = d.toLocaleDateString('en-US', { weekday: 'short' });
  const md = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  return `${wd} · ${md}`.toUpperCase();
}
