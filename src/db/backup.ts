import type { SavedWorkout, Session } from '../domain/types';
import { db } from './db';
import { savedWorkoutRepo, sessionRepo } from './repo';

interface BackupFile {
  app: 'circuit20';
  version: 1;
  exportedAt: string;
  sessions: Session[];
  /** Missing from backups made before saved workouts existed. */
  savedWorkouts?: SavedWorkout[];
}

/** Share the backup via the share sheet where supported, else download it. */
export async function exportBackup(): Promise<void> {
  const data: BackupFile = {
    app: 'circuit20',
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions: await db.sessions.toArray(),
    savedWorkouts: await db.savedWorkouts.toArray(),
  };
  const name = `circuit20-${new Date().toISOString().slice(0, 10)}.json`;
  const file = new File([JSON.stringify(data, null, 2)], name, { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Returns the number of sessions added or updated. */
export async function importBackup(file: File): Promise<number> {
  const data = JSON.parse(await file.text()) as Partial<BackupFile>;
  if (data.app !== 'circuit20' || !Array.isArray(data.sessions)) throw new Error('not a Circuit//20 backup');
  if (Array.isArray(data.savedWorkouts)) await savedWorkoutRepo.merge(data.savedWorkouts);
  return sessionRepo.merge(data.sessions);
}
