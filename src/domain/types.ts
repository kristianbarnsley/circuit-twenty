export const EQUIPMENT = ['mat', 'dumbbells', 'cable1', 'cable2', 'pullupBar'] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const MUSCLES = [
  'quads', 'glutes', 'hamstrings', 'chest', 'shoulders', 'triceps', 'back', 'biceps', 'core',
] as const;
export type Muscle = (typeof MUSCLES)[number];

/** Movement pattern — a workout never contains two exercises with the same pattern. */
export type Pattern =
  | 'squat' | 'hinge' | 'lunge' | 'pushH' | 'pushV' | 'pullH' | 'pullV' | 'core' | 'full';

/** Where the work is concentrated. `full` counts as both upper and lower. */
export type Region = 'lower' | 'upper' | 'full' | 'core';

export interface Exercise {
  id: string;
  name: string;
  /** Every item listed is required. Empty = bodyweight. */
  equipment: Equipment[];
  pattern: Pattern;
  region: Region;
  /** Relative impact per muscle, 0–1. */
  muscles: Partial<Record<Muscle, number>>;
  defaultReps: number;
  /** Suggested load in kg; omitted for bodyweight moves. */
  defaultKg?: number;
  /** How the load is measured, e.g. "per dumbbell". */
  loadNote?: string;
  /** Rep note shown next to reps, e.g. "alt." or "each side". */
  repNote?: string;
}

export interface Slot {
  exerciseId: string;
  reps: number;
  kg?: number;
}

export interface Draft {
  seed: number;
  equipment: Equipment[];
  slots: Slot[];
  /** Exercises removed with ✕ during this draft; never suggested again for it. */
  excluded: string[];
  /** Bumped on every swap so repeated swaps draw different random numbers. */
  swaps: number;
}

export interface SessionExercise {
  exerciseId: string;
  name: string;
  reps: number;
  kg?: number;
}

export interface Session {
  id: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  equipment: Equipment[];
  seed: number;
  exercises: SessionExercise[];
  durationSec: number;
  /** Full circuits completed. */
  rounds: number;
  /** Exercises completed in the unfinished round (0–2). */
  partial: number;
  /** 0 = EASY … 4 = MAX */
  effort: number;
  notes: string;
}

export interface ActiveRun {
  seed: number;
  equipment: Equipment[];
  exercises: SessionExercise[];
  startedAt: number;
  /** Timestamp the current pause began, or null while running. */
  pausedAt: number | null;
  /** Total ms spent paused before the current pause. */
  pausedMs: number;
  rounds: number;
  done: boolean[];
  cuesFired: string[];
  endedAt?: number;
}

export const WORKOUT_SECONDS = 20 * 60;
