import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { BackIcon, CloseIcon, PlayIcon, RerollIcon } from '../components/icons';
import { Box, Header, Prompt, Stepper } from '../components/ui';
import { EXERCISE_BY_ID, equipmentTag, exercisePool } from '../data/exercises';
import { useSessions } from '../db/repo';
import type { Draft, Slot } from '../domain/types';
import { buildHistoryState, EMPTY_HISTORY } from '../engine/history';
import { generate, swap } from '../engine/planner';
import { newSeed, seedLabel } from '../engine/rng';
import { unlockAudio } from '../lib/beep';
import { useApp } from '../state/store';
import { makeSlot, toSessionExercise } from './shared';

export default function Generate() {
  const nav = useNavigate();
  const draft = useApp((s) => s.draft);
  const setDraft = useApp((s) => s.setDraft);
  const setRun = useApp((s) => s.setRun);
  const sessions = useSessions();
  const hist = useMemo(() => (sessions ? buildHistoryState(sessions) : EMPTY_HISTORY), [sessions]);
  const [msg, setMsg] = useState('');

  if (!draft) return <Navigate to="/" replace />;

  const pool = exercisePool(draft.equipment);
  const exs = draft.slots.map((s) => EXERCISE_BY_ID[s.exerciseId]);
  const repsPerRound = draft.slots.reduce((a, s) => a + s.reps, 0);

  const update = (d: Partial<Draft>) => setDraft({ ...draft, ...d });
  const updateSlot = (i: number, s: Partial<Slot>) =>
    update({ slots: draft.slots.map((x, j) => (j === i ? { ...x, ...s } : x)) });

  const onSwap = (i: number) => {
    const excluded = [...draft.excluded, draft.slots[i].exerciseId];
    const repl = swap(pool, hist, exs, i, excluded, draft.seed + draft.swaps + 1);
    if (!repl) {
      setMsg('no other exercise fits this slot');
      return;
    }
    setMsg('');
    update({
      excluded,
      swaps: draft.swaps + 1,
      slots: draft.slots.map((x, j) => (j === i ? makeSlot(repl, hist) : x)),
    });
  };

  const onReroll = () => {
    const seed = newSeed();
    // Keep avoiding exercises removed with ✕, unless that leaves no valid circuit.
    let excluded = draft.excluded;
    let next = generate(pool, hist, seed, excluded);
    if (!next) {
      excluded = [];
      next = generate(pool, hist, seed);
    }
    if (!next) return;
    setMsg('');
    update({ seed, swaps: 0, excluded, slots: next.map((e) => makeSlot(e, hist)) });
  };

  const onStart = () => {
    unlockAudio();
    setRun({
      seed: draft.seed,
      equipment: draft.equipment,
      exercises: draft.slots.map(toSessionExercise),
      startedAt: Date.now(),
      pausedAt: null,
      pausedMs: 0,
      rounds: 0,
      done: draft.slots.map(() => false),
      cuesFired: [],
    });
    nav('/run', { replace: true });
  };

  return (
    <>
      <Header>
        <span className="hdr-meta">seed <span className="amber">#{seedLabel(draft.seed)}</span></span>
      </Header>
      <main className="main tight bottom-pad">
        <Link to="/" className="link-btn back"><BackIcon /> equipment</Link>

        <div className="stack g8">
          <Prompt cmd="generate --amrap 20" />
          <h1 className="h1">Your circuit</h1>
          <div className="prompt"><span className="hi">{repsPerRound}</span> reps / round · repeat until 00:00</div>
        </div>

        <div className="stack g16">
          {draft.slots.map((slot, i) => {
            const ex = exs[i];
            const lastKg = hist.lastKg[ex.id];
            return (
              <Box key={`${i}-${ex.id}`} label={`0${i + 1}`}>
                <div className="ex-head">
                  <div className="ex-reps">×{slot.reps}</div>
                  <div className="stack g6" style={{ flexGrow: 1 }}>
                    <div className="ex-name">{ex.name}{ex.repNote && <span className="muted small"> ({ex.repNote})</span>}</div>
                    <div className="ex-tag">#{equipmentTag(ex)}</div>
                  </div>
                  <button type="button" className="icon-btn" aria-label={`Remove ${ex.name} and replace it`} onClick={() => onSwap(i)}>
                    <CloseIcon />
                  </button>
                </div>
                <Stepper
                  id={`reps-${i}`} name={ex.name} unit="reps" step={1} min={1}
                  label={<>reps <span className="sugg">· default {ex.defaultReps}</span></>}
                  note={ex.repNote}
                  value={slot.reps}
                  onChange={(reps) => updateSlot(i, { reps: Math.round(reps) || 1 })}
                />
                {slot.kg !== undefined && (
                  <Stepper
                    id={`kg-${i}`} name={ex.name} unit="kg" step={2.5}
                    label={<>load <span className="sugg">· {lastKg !== undefined ? `last ${lastKg}` : `suggested ${ex.defaultKg}`} kg</span></>}
                    note={ex.loadNote}
                    value={slot.kg}
                    onChange={(kg) => updateSlot(i, { kg })}
                  />
                )}
              </Box>
            );
          })}
        </div>
        {msg && <div className="toast err">! {msg}</div>}

        <div className="spacer" />

        <div className="stack g10">
          <button type="button" className="btn" onClick={onReroll}><RerollIcon /> REROLL ALL</button>
          <button type="button" className="cta" onClick={onStart}>
            <span>START · 20:00</span>
            <PlayIcon />
          </button>
        </div>
      </main>
    </>
  );
}
