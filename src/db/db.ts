import Dexie, { type Table } from 'dexie';
import type { SavedWorkout, Session } from '../domain/types';

export const db = new Dexie('circuit20') as Dexie & {
  sessions: Table<Session, string>;
  savedWorkouts: Table<SavedWorkout, string>;
};

/** Built-in saved workouts. Fixed ids so re-seeding or merging a backup never duplicates them. */
const SEED_WORKOUTS: Omit<SavedWorkout, 'createdAt' | 'updatedAt'>[] = [
  { id: 'seed-cindy', name: 'Cindy', exerciseIds: ['air-squat', 'push-up', 'pull-up'] },
  { id: 'seed-cable-cindy', name: 'Cable-cindy', exerciseIds: ['air-squat', 'push-up', 'cable-pulldown'] },
];

function seedWorkouts(table: Table<SavedWorkout, string>) {
  const now = Date.now();
  return table.bulkPut(SEED_WORKOUTS.map((w, i) => ({ ...w, createdAt: now + i, updatedAt: now })));
}

db.version(1).stores({
  sessions: 'id, createdAt, updatedAt',
});

db.version(2)
  .stores({
    sessions: 'id, createdAt, updatedAt',
    savedWorkouts: 'id, createdAt, updatedAt',
  })
  .upgrade((tx) => seedWorkouts(tx.table('savedWorkouts')));

// Fresh installs skip upgrade() and go straight to populate.
db.on('populate', (tx) => seedWorkouts(tx.table('savedWorkouts')));
