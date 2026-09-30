import { EXERCISE_BY_ID } from '../data/exercises';
import type { Exercise, SessionExercise, Slot } from '../domain/types';
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
