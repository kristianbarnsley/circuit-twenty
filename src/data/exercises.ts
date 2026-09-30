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
  { id: 'jump-squat', name: 'Jump squat', equipment: [], pattern: 'squat', region: 'lower', defaultReps: 12,
    muscles: { quads: 1, glutes: 0.8, hamstrings: 0.3, core: 0.2 } },
  { id: 'jump-lunge', name: 'Jump lunge', equipment: [], pattern: 'lunge', region: 'lower', defaultReps: 16, repNote: 'alt.',
    muscles: { quads: 0.9, glutes: 0.8, hamstrings: 0.4, core: 0.2 } },
  { id: 'walking-lunge', name: 'Walking lunge', equipment: [], pattern: 'lunge', region: 'lower', defaultReps: 16, repNote: 'alt.',
    muscles: { quads: 0.9, glutes: 0.8, hamstrings: 0.4, core: 0.2 } },
  { id: 'push-up', name: 'Push-up', equipment: [], pattern: 'pushH', region: 'upper', defaultReps: 10,
    muscles: { chest: 1, triceps: 0.7, shoulders: 0.5, core: 0.4 } },
  { id: 'hand-release-push-up', name: 'Hand-release push-up', equipment: [], pattern: 'pushH', region: 'upper', defaultReps: 10,
    muscles: { chest: 1, triceps: 0.7, shoulders: 0.6, back: 0.2, core: 0.4 } },
  { id: 'pike-push-up', name: 'Pike push-up', equipment: [], pattern: 'pushV', region: 'upper', defaultReps: 8,
    muscles: { shoulders: 1, triceps: 0.6, chest: 0.2, core: 0.3 } },
  { id: 'burpee', name: 'Burpee', equipment: [], pattern: 'full', region: 'full', defaultReps: 8,
    muscles: { quads: 0.5, glutes: 0.4, chest: 0.6, triceps: 0.4, shoulders: 0.3, core: 0.5 } },
  { id: 'mountain-climber', name: 'Mountain climber', equipment: [], pattern: 'core', region: 'core', defaultReps: 20, repNote: 'alt.',
    muscles: { core: 0.9, shoulders: 0.4, quads: 0.3 } },

  // ── Mat ───────────────────────────────────────────────────────
  { id: 'sit-up', name: 'Sit-up', equipment: ['mat'], pattern: 'core', region: 'core', defaultReps: 15,
    muscles: { core: 1 } },
  { id: 'v-up', name: 'V-up', equipment: ['mat'], pattern: 'core', region: 'core', defaultReps: 12,
    muscles: { core: 1, quads: 0.1 } },
  { id: 'hollow-rock', name: 'Hollow rock', equipment: ['mat'], pattern: 'core', region: 'core', defaultReps: 15,
    muscles: { core: 1 } },
  { id: 'push-up-t-rotation', name: 'Push-up T-rotation', equipment: ['mat'], pattern: 'pushH', region: 'upper', defaultReps: 10, repNote: 'alt.',
    muscles: { chest: 0.9, triceps: 0.6, shoulders: 0.6, core: 0.6 } },
  { id: 'single-leg-bridge', name: 'Single-leg glute bridge', equipment: ['mat'], pattern: 'hinge', region: 'lower', defaultReps: 12, repNote: 'each side',
    muscles: { glutes: 1, hamstrings: 0.7, core: 0.3 } },

  // ── Pull-up bar ───────────────────────────────────────────────
  { id: 'pull-up', name: 'Pull-up', equipment: ['pullupBar'], pattern: 'pullV', region: 'upper', defaultReps: 5,
    muscles: { back: 1, biceps: 0.6, shoulders: 0.2, core: 0.2 } },
  { id: 'chin-up', name: 'Chin-up', equipment: ['pullupBar'], pattern: 'pullV', region: 'upper', defaultReps: 6,
    muscles: { back: 0.9, biceps: 0.8, core: 0.2 } },
  { id: 'burpee-pull-up', name: 'Burpee pull-up', equipment: ['pullupBar'], pattern: 'full', region: 'full', defaultReps: 6,
    muscles: { back: 0.7, biceps: 0.4, chest: 0.5, triceps: 0.3, quads: 0.4, glutes: 0.3, core: 0.4 } },
  { id: 'toes-to-bar', name: 'Toes-to-bar', equipment: ['pullupBar'], pattern: 'core', region: 'core', defaultReps: 8,
    muscles: { core: 1, back: 0.3, shoulders: 0.2 } },
  { id: 'knees-to-elbow', name: 'Knees-to-elbow', equipment: ['pullupBar'], pattern: 'core', region: 'core', defaultReps: 10,
    muscles: { core: 1, back: 0.3, shoulders: 0.2 } },

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
  { id: 'devil-press', name: 'Devil press', equipment: ['dumbbells'], pattern: 'full', region: 'full', defaultReps: 6,
    defaultKg: 12.5, loadNote: 'per dumbbell',
    muscles: { chest: 0.6, triceps: 0.4, shoulders: 0.7, glutes: 0.7, hamstrings: 0.6, back: 0.4, core: 0.4 } },
  { id: 'man-maker', name: 'Man maker', equipment: ['dumbbells'], pattern: 'full', region: 'full', defaultReps: 6,
    defaultKg: 10, loadNote: 'per dumbbell',
    muscles: { chest: 0.6, triceps: 0.5, shoulders: 0.7, back: 0.6, quads: 0.6, glutes: 0.5, core: 0.6 } },
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
  { id: 'db-hang-clean', name: 'DB hang power clean', equipment: ['dumbbells'], pattern: 'hinge', region: 'full', defaultReps: 10,
    defaultKg: 15, loadNote: 'per dumbbell',
    muscles: { glutes: 0.7, hamstrings: 0.6, quads: 0.4, back: 0.5, shoulders: 0.3, biceps: 0.3, core: 0.3 } },
  { id: 'db-reverse-lunge', name: 'DB reverse lunge', equipment: ['dumbbells'], pattern: 'lunge', region: 'lower', defaultReps: 12, repNote: 'alt.',
    defaultKg: 12.5, loadNote: 'per dumbbell',
    muscles: { quads: 0.9, glutes: 0.9, hamstrings: 0.4, core: 0.3 } },
  { id: 'db-lunge-curl', name: 'DB lunge + curl', equipment: ['dumbbells'], pattern: 'lunge', region: 'full', defaultReps: 10, repNote: 'alt.',
    defaultKg: 10, loadNote: 'per dumbbell',
    muscles: { quads: 0.8, glutes: 0.7, hamstrings: 0.3, biceps: 0.6, core: 0.2 } },
  { id: 'db-overhead-lunge', name: 'DB overhead lunge', equipment: ['dumbbells'], pattern: 'lunge', region: 'full', defaultReps: 10, repNote: 'alt.',
    defaultKg: 10, loadNote: 'single dumbbell',
    muscles: { quads: 0.8, glutes: 0.7, shoulders: 0.5, core: 0.6 } },
  { id: 'db-push-press', name: 'DB push press', equipment: ['dumbbells'], pattern: 'pushV', region: 'upper', defaultReps: 10,
    defaultKg: 15, loadNote: 'per dumbbell',
    muscles: { shoulders: 1, triceps: 0.7, quads: 0.3, core: 0.3 } },
  { id: 'db-floor-press', name: 'DB floor press', equipment: ['dumbbells', 'mat'], pattern: 'pushH', region: 'upper', defaultReps: 12,
    defaultKg: 17.5, loadNote: 'per dumbbell',
    muscles: { chest: 1, triceps: 0.7, shoulders: 0.4 } },
  { id: 'renegade-row', name: 'Renegade row', equipment: ['dumbbells'], pattern: 'pullH', region: 'upper', defaultReps: 10, repNote: 'alt.',
    defaultKg: 12.5, loadNote: 'per dumbbell',
    muscles: { back: 0.9, biceps: 0.4, core: 0.7, chest: 0.3, triceps: 0.3 } },
  { id: 'db-bent-row', name: 'DB bent-over row', equipment: ['dumbbells'], pattern: 'pullH', region: 'upper', defaultReps: 12,
    defaultKg: 17.5, loadNote: 'per dumbbell',
    muscles: { back: 1, biceps: 0.5, hamstrings: 0.2, core: 0.2 } },

  // ── Cable machine ×1 ──────────────────────────────────────────
  { id: 'cable-squat-row', name: 'Cable squat-to-row', equipment: ['cable1'], pattern: 'pullH', region: 'full', defaultReps: 12,
    defaultKg: 25, loadNote: 'stack',
    muscles: { quads: 0.6, glutes: 0.6, back: 0.8, biceps: 0.4, core: 0.2 } },
  { id: 'cable-woodchop', name: 'Cable woodchop', equipment: ['cable1'], pattern: 'core', region: 'core', defaultReps: 12, repNote: 'each side',
    defaultKg: 15, loadNote: 'stack',
    muscles: { core: 1, shoulders: 0.4, glutes: 0.3 } },
  { id: 'cable-single-arm-row', name: 'Cable single-arm row', equipment: ['cable1'], pattern: 'pullH', region: 'upper', defaultReps: 12, repNote: 'each side',
    defaultKg: 20, loadNote: 'stack',
    muscles: { back: 1, biceps: 0.5, core: 0.3 } },
  { id: 'cable-pulldown', name: 'Half-kneeling cable pulldown', equipment: ['cable1'], pattern: 'pullV', region: 'upper', defaultReps: 12, repNote: 'each side',
    defaultKg: 20, loadNote: 'stack',
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
  { id: 'cable-split-squat-press', name: 'Split squat + cable press', equipment: ['cable2'], pattern: 'lunge', region: 'full', defaultReps: 10, repNote: 'alt.',
    defaultKg: 12.5, loadNote: 'each stack',
    muscles: { quads: 0.7, glutes: 0.6, chest: 0.7, triceps: 0.4, shoulders: 0.4, core: 0.4 } },
  { id: 'cable-squat-high-row', name: 'Dual cable squat to high row', equipment: ['cable2'], pattern: 'squat', region: 'full', defaultReps: 12,
    defaultKg: 15, loadNote: 'each stack',
    muscles: { quads: 0.7, glutes: 0.6, back: 0.7, shoulders: 0.5, biceps: 0.3 } },
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
