import type { Equipment, Exercise } from '../domain/types';

/**
 * Exercise reference DB.
 *
 * Cindy-spirit: compound moves you can cycle fast, sets that take well under a
 * minute. Muscle scores are rough 0–1 impact estimates — tweak freely; the
 * planner only cares about relative values.
 */
export const EXERCISES: Exercise[] = [
  // ── Bodyweight (always available) ─────────────────────────────
  { id: 'air-squat', name: 'Air squat', equipment: [], pattern: 'squat', region: 'lower', defaultReps: 15,
    muscles: { quads: 1, glutes: 0.8, hamstrings: 0.3, core: 0.3 } },
  { id: 'jump-squat', name: 'Jump squat', equipment: [], pattern: 'squat', region: 'lower', defaultReps: 10,
    muscles: { quads: 1, glutes: 0.8, hamstrings: 0.3, core: 0.2 } },
  { id: 'jump-lunge', name: 'Jump lunge', equipment: [], pattern: 'lunge', region: 'lower', defaultReps: 12, repNote: 'alt.',
    muscles: { quads: 0.9, glutes: 0.8, hamstrings: 0.4, core: 0.2 } },
  { id: 'walking-lunge', name: 'Walking lunge', equipment: [], pattern: 'lunge', region: 'lower', defaultReps: 16, repNote: 'alt.',
    muscles: { quads: 0.9, glutes: 0.8, hamstrings: 0.4, core: 0.2 } },

  // ── Mat ───────────────────────────────────────────────────────
  { id: 'sit-up', name: 'Sit-up', equipment: ['mat'], pattern: 'core', region: 'core', defaultReps: 15,
    muscles: { core: 1 } },
  { id: 'push-up-t-rotation', name: 'Push-up T-rotation', equipment: ['mat'], pattern: 'pushH', region: 'upper', defaultReps: 8, repNote: 'alt.',
    muscles: { chest: 0.9, triceps: 0.6, shoulders: 0.6, core: 0.6 } },
  { id: 'push-up', name: 'Push-up', equipment: [], pattern: 'pushH', region: 'upper', defaultReps: 10,
    muscles: { chest: 1, triceps: 0.7, shoulders: 0.5, core: 0.4 } },
  { id: 'burpee', name: 'Burpee', equipment: [], pattern: 'full', region: 'full', defaultReps: 8,
    muscles: { quads: 0.5, glutes: 0.4, chest: 0.6, triceps: 0.4, shoulders: 0.3, core: 0.5 } },
  { id: 'mountain-climber', name: 'Mountain climber', equipment: [], pattern: 'core', region: 'core', defaultReps: 16, repNote: 'alt.',
    muscles: { core: 0.9, shoulders: 0.4, quads: 0.3 } },

  // ── Pull-up bar ───────────────────────────────────────────────
  { id: 'pull-up', name: 'Pull-up', equipment: ['pullupBar'], pattern: 'pullV', region: 'upper', defaultReps: 5,
    muscles: { back: 1, biceps: 0.6, shoulders: 0.2, core: 0.2 } },
  { id: 'chin-up', name: 'Chin-up', equipment: ['pullupBar'], pattern: 'pullV', region: 'upper', defaultReps: 6,
    muscles: { back: 0.9, biceps: 0.8, core: 0.2 } },

  // ── Dumbbells ─────────────────────────────────────────────────
  { id: 'db-thruster', name: 'DB thruster', equipment: ['dumbbells'], pattern: 'full', region: 'full', defaultReps: 10,
    defaultKg: 12.5, loadNote: 'per dumbbell',
    muscles: { quads: 0.9, glutes: 0.7, shoulders: 0.9, triceps: 0.5, core: 0.4 } },
  { id: 'db-clean-press', name: 'DB clean & press', equipment: ['dumbbells'], pattern: 'full', region: 'full', defaultReps: 8,
    defaultKg: 15, loadNote: 'per dumbbell',
    muscles: { glutes: 0.7, hamstrings: 0.6, quads: 0.5, shoulders: 0.8, triceps: 0.4, back: 0.4, core: 0.4 } },
  { id: 'db-snatch', name: 'DB snatch', equipment: ['dumbbells'], pattern: 'full', region: 'full', defaultReps: 12, repNote: 'alt.',
    defaultKg: 17.5, loadNote: 'single dumbbell',
    muscles: { glutes: 0.8, hamstrings: 0.7, shoulders: 0.7, back: 0.5, quads: 0.4, core: 0.5 } },
  { id: 'db-burpee-deadlift', name: 'DB burpee deadlift', equipment: ['dumbbells'], pattern: 'full', region: 'full', defaultReps: 8,
    defaultKg: 15, loadNote: 'per dumbbell',
    muscles: { glutes: 0.8, hamstrings: 0.7, quads: 0.4, chest: 0.4, back: 0.4, core: 0.5 } },
  { id: 'db-goblet-squat', name: 'DB goblet squat', equipment: ['dumbbells'], pattern: 'squat', region: 'lower', defaultReps: 12,
    defaultKg: 20, loadNote: 'single dumbbell',
    muscles: { quads: 1, glutes: 0.8, hamstrings: 0.3, core: 0.4 } },
  { id: 'db-front-squat', name: 'DB front squat', equipment: ['dumbbells'], pattern: 'squat', region: 'lower', defaultReps: 10,
    defaultKg: 15, loadNote: 'per dumbbell',
    muscles: { quads: 1, glutes: 0.8, hamstrings: 0.3, core: 0.5 } },
  { id: 'db-rdl', name: 'DB Romanian deadlift', equipment: ['dumbbells'], pattern: 'hinge', region: 'lower', defaultReps: 12,
    defaultKg: 20, loadNote: 'per dumbbell',
    muscles: { hamstrings: 1, glutes: 0.8, back: 0.4, core: 0.3 } },
  { id: 'db-swing', name: 'DB swing', equipment: ['dumbbells'], pattern: 'hinge', region: 'lower', defaultReps: 15,
    defaultKg: 20, loadNote: 'single dumbbell',
    muscles: { glutes: 1, hamstrings: 0.8, back: 0.3, shoulders: 0.2, core: 0.4 } },
  { id: 'db-reverse-lunge', name: 'DB reverse lunge', equipment: ['dumbbells'], pattern: 'lunge', region: 'lower', defaultReps: 12, repNote: 'alt.',
    defaultKg: 12.5, loadNote: 'per dumbbell',
    muscles: { quads: 0.9, glutes: 0.9, hamstrings: 0.4, core: 0.3 } },

  // ── Cable machine ×1 ──────────────────────────────────────────
  { id: 'cable-woodchop', name: 'Cable woodchop', equipment: ['cable1'], pattern: 'core', region: 'core', defaultReps: 12, repNote: 'each side',
    defaultKg: 15, loadNote: 'stack',
    muscles: { core: 1, shoulders: 0.4, glutes: 0.3 } },
  { id: 'cable-single-arm-row', name: 'Cable single-arm row', equipment: ['cable1'], pattern: 'pullH', region: 'upper', defaultReps: 12, repNote: 'each side',
    defaultKg: 20, loadNote: 'stack',
    muscles: { back: 1, biceps: 0.5, core: 0.3 } },
  { id: 'cable-pulldown', name: 'Cable pulldown', equipment: ['cable1'], pattern: 'pullV', region: 'upper', defaultReps: 8,
    defaultKg: 35, loadNote: 'stack',
    muscles: { back: 1, biceps: 0.5, core: 0.3 } },
  { id: 'cable-pull-through', name: 'Cable pull-through', equipment: ['cable1'], pattern: 'hinge', region: 'lower', defaultReps: 15,
    defaultKg: 30, loadNote: 'stack',
    muscles: { glutes: 1, hamstrings: 0.8, core: 0.2 } },
  { id: 'cable-single-arm-press', name: 'Cable single-arm press', equipment: ['cable1'], pattern: 'pushH', region: 'upper', defaultReps: 12, repNote: 'each side',
    defaultKg: 15, loadNote: 'stack',
    muscles: { chest: 0.8, triceps: 0.5, shoulders: 0.5, core: 0.5 } },

  // ── Cable machine ×2 ──────────────────────────────────────────
  { id: 'cable-chest-press', name: 'Standing cable chest press', equipment: ['cable2'], pattern: 'pushH', region: 'upper', defaultReps: 12,
    defaultKg: 15, loadNote: 'each stack',
    muscles: { chest: 1, triceps: 0.6, shoulders: 0.5, core: 0.4 } },
];

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export interface EquipmentDef {
  id: Equipment;
  label: string;
  desc: string;
}

export const EQUIPMENT_DEFS: EquipmentDef[] = [
  { id: 'mat', label: 'mat', desc: 'floor · core' },
  { id: 'dumbbells', label: 'dumbbells', desc: 'free weights' },
  { id: 'cable1', label: 'cable_machine ×1', desc: 'single stack' },
  { id: 'cable2', label: 'cable_machine ×2', desc: 'dual stack · crossover' },
  { id: 'pullupBar', label: 'pull_up_bar', desc: 'hang · pull' },
];

export const EQUIPMENT_TAG: Record<Equipment, string> = {
  mat: 'mat', dumbbells: 'dumbbells', cable1: 'cable_machine', cable2: 'cable_machine ×2', pullupBar: 'pull_up_bar',
};

/** Two cable stations also give you one. */
export function expandEquipment(eq: Equipment[]): Set<Equipment> {
  const set = new Set(eq);
  if (set.has('cable2')) set.add('cable1');
  return set;
}

export function exercisePool(eq: Equipment[]): Exercise[] {
  const have = expandEquipment(eq);
  return EXERCISES.filter((e) => e.equipment.every((q) => have.has(q)));
}

export function equipmentTag(e: Exercise): string {
  return e.equipment.length ? e.equipment.map((q) => EQUIPMENT_TAG[q]).join(' · ') : 'bodyweight';
}
