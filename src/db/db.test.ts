import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { describe, expect, it } from 'vitest';
import { findSavedWorkout } from '../screens/shared';

describe('saved workouts', () => {
  it('seeds Cindy and Cable-cindy when upgrading an existing v1 database', async () => {
    const old = new Dexie('circuit20');
    old.version(1).stores({ sessions: 'id, createdAt, updatedAt' });
    await old.open();
    await old.table('sessions').put({ id: 's1', createdAt: 1, updatedAt: 1 });
    old.close();

    const { db } = await import('./db');
    const { savedWorkoutRepo } = await import('./repo');
    expect((await savedWorkoutRepo.list()).map((w) => w.name)).toEqual(['Cindy', 'Cable-cindy']);
    expect(await db.sessions.count()).toBe(1);
    db.close();
  });

  it('seeds a fresh database', async () => {
    await Dexie.delete('circuit20');
    const { db } = await import('./db');
    await db.open();
    const { savedWorkoutRepo } = await import('./repo');
    const list = await savedWorkoutRepo.list();
    expect(list.map((w) => w.exerciseIds)).toEqual([
      ['air-squat', 'push-up', 'pull-up'],
      ['air-squat', 'push-up', 'cable-pulldown'],
    ]);
    expect(findSavedWorkout(list, ['pull-up', 'air-squat', 'push-up'])?.name).toBe('Cindy');
    expect(findSavedWorkout(list, ['pull-up', 'air-squat', 'burpee'])).toBeUndefined();
  });
});
