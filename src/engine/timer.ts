import { WORKOUT_SECONDS, type ActiveRun } from '../domain/types';

/** Active (unpaused) time, frozen once the run is paused or ended. */
export function elapsedMs(run: ActiveRun, now: number): number {
  const end = run.endedAt ?? run.pausedAt ?? now;
  return Math.max(0, end - run.startedAt - run.pausedMs);
}

export function remainingSec(run: ActiveRun, now: number): number {
  return Math.max(0, WORKOUT_SECONDS - Math.floor(elapsedMs(run, now) / 1000));
}
